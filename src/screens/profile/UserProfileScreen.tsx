import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image,
  Share,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileStackParamList } from '../../navigation/RootNavigator';
import { User, Post } from '../../types/models';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { PostGrid } from '../../components/profile/PostGrid';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile } from '../../services/userService';
import { getUserPosts } from '../../services/postService';
import {
  toggleFollow,
  checkIsFollowing,
  getFollowersCount,
  getFollowingCount,
} from '../../services/followService';
import { getOrCreateConversation } from '../../services/conversationService';

type UserProfileScreenRouteProp = RouteProp<ProfileStackParamList, 'UserProfile'>;
type UserProfileScreenNavigationProp = NativeStackNavigationProp<ProfileStackParamList>;

export const UserProfileScreen: React.FC = () => {
  const route = useRoute<UserProfileScreenRouteProp>();
  const navigation = useNavigation<UserProfileScreenNavigationProp>();
  const { user: currentUser } = useAuth();
  const { userId } = route.params;

  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [followLoading, setFollowLoading] = useState(false);
  const [messageLoading, setMessageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 自分のプロフィールの場合は MyProfileScreen に遷移
  const isOwnProfile = currentUser?.id === userId;

  // プロフィール情報を取得
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // ユーザー情報、投稿、フォロー数を並列取得
      const [userResult, postsResult, followersResult, followingResult, isFollowingResult] =
        await Promise.all([
          getUserProfile(userId),
          getUserPosts(userId),
          getFollowersCount(userId),
          getFollowingCount(userId),
          currentUser ? checkIsFollowing(currentUser.id, userId) : Promise.resolve({ isFollowing: false, error: null }),
        ]);

      if (userResult.error) {
        console.error('ユーザー情報取得エラー:', userResult.error);
        setError('ユーザー情報の取得に失敗しました');
        return;
      }

      if (postsResult.error) {
        console.error('投稿取得エラー:', postsResult.error);
      }

      setProfileUser(userResult.data!);
      setPosts(postsResult.data || []);
      setFollowersCount(followersResult.count);
      setFollowingCount(followingResult.count);
      setIsFollowing(isFollowingResult.isFollowing);
    } catch (err) {
      console.error('プロフィール取得エラー:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  }, [userId, currentUser]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // フォロー/アンフォロー処理
  const handleFollowToggle = async () => {
    if (!currentUser) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      setFollowLoading(true);
      const { isFollowing: newIsFollowing, error } = await toggleFollow(
        currentUser.id,
        userId
      );

      if (error) {
        console.error('フォロー切り替えエラー:', error);
        window.alert('エラー: フォローの切り替えに失敗しました');
        return;
      }

      // 楽観的UIアップデート
      setIsFollowing(newIsFollowing);
      setFollowersCount((prev) => (newIsFollowing ? prev + 1 : prev - 1));
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setFollowLoading(false);
    }
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleFollowersPress = () => {
    navigation.navigate('Followers', {
      userId,
      username: profileUser?.username
    });
  };

  const handleFollowingPress = () => {
    navigation.navigate('Following', {
      userId,
      username: profileUser?.username
    });
  };

  const handleSharePress = async () => {
    if (!profileUser) return;

    try {
      await Share.share({
        message: `@${profileUser.username}さんのプロフィールをチェック！`,
      });
    } catch (error) {
      console.error('Failed to share profile:', error);
    }
  };

  const handleMessagePress = async () => {
    if (!currentUser || !profileUser) {
      window.alert('ログインが必要です');
      return;
    }

    // フォローしていない場合は警告
    if (!isFollowing) {
      window.alert('このユーザーをフォローするとメッセージを送れます');
      return;
    }

    try {
      setMessageLoading(true);
      const { data: conversation, error } = await getOrCreateConversation(
        currentUser.id,
        profileUser.id
      );

      if (error) {
        console.error('会話作成エラー:', error);
        window.alert('エラー: メッセージを開始できませんでした');
        return;
      }

      if (conversation) {
        // @ts-ignore - Navigate to Messages tab's Chat screen
        const tabNavigation = navigation.getParent();
        if (tabNavigation) {
          tabNavigation.navigate('Messages', {
            screen: 'Chat',
            params: {
              conversationId: conversation.id,
              otherUser: profileUser,
            },
          });
        }
      }
    } catch (err) {
      console.error('Failed to create conversation:', err);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setMessageLoading(false);
    }
  };

  // ローディング中
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>読み込み中...</Text>
      </View>
    );
  }

  // エラー表示
  if (error || !profileUser) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error || 'ユーザーが見つかりません'}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchProfile}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* カスタムヘッダー（他のユーザー用） */}
      <View style={styles.header}>
        {/* アバター */}
        <View style={styles.avatarContainer}>
          {profileUser.avatarUrl ? (
            <Image source={{ uri: profileUser.avatarUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profileUser.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        {/* ユーザー情報 */}
        <View style={styles.infoContainer}>
          <Text style={styles.username}>@{profileUser.username}</Text>
          {profileUser.displayName && (
            <Text style={styles.displayName}>{profileUser.displayName}</Text>
          )}
          {profileUser.bio && <Text style={styles.bio}>{profileUser.bio}</Text>}
        </View>

        {/* アクションボタン */}
        {!isOwnProfile && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.followButton, isFollowing && styles.followingButton]}
              onPress={handleFollowToggle}
              disabled={followLoading}
              activeOpacity={0.7}
            >
              {followLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.followButtonText}>
                  {isFollowing ? 'フォロー中' : 'フォローする'}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.messageButton, !isFollowing && styles.messageButtonDisabled]}
              onPress={handleMessagePress}
              disabled={!isFollowing || messageLoading}
              activeOpacity={0.7}
            >
              {messageLoading ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={[styles.messageButtonText, !isFollowing && styles.messageButtonTextDisabled]}>メッセージ</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.shareButton}
              onPress={handleSharePress}
              activeOpacity={0.7}
            >
              <Text style={styles.shareButtonText}>シェア</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 統計情報 */}
      <ProfileStats
        postsCount={posts.length}
        followersCount={followersCount}
        followingCount={followingCount}
        onFollowersPress={handleFollowersPress}
        onFollowingPress={handleFollowingPress}
      />

      {/* 投稿グリッド */}
      <PostGrid posts={posts} onPostPress={handlePostPress} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#000000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: '#808080',
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  username: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  displayName: {
    fontSize: Typography.fontSize.base,
    color: '#B0B0B0',
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  followButton: {
    flex: 2,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 40,
  },
  followingButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  followButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  messageButton: {
    flex: 1.5,
    backgroundColor: '#000000',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  messageButtonDisabled: {
    backgroundColor: '#1A1A1A',
    borderColor: '#3A3A3A',
    opacity: 0.5,
  },
  messageButtonTextDisabled: {
    color: '#606060',
  },
  shareButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    marginTop: Spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: Spacing.xl,
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
