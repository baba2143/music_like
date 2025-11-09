import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Text,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { PostGrid } from '../../components/profile/PostGrid';
import { Post, User } from '../../types/models';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { getUserPosts, getSavedPosts } from '../../services/postService';
import { getUserProfile } from '../../services/userService';
import { getFollowersCount, getFollowingCount } from '../../services/followService';
import { Colors, Spacing, Typography } from '../../config/theme';

type MyProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'posts' | 'playlists' | 'saved';

export const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<MyProfileScreenNavigationProp>();
  const { user } = useAuth(); // これはSupabase認証User（id, emailのみ）
  const [profile, setProfile] = useState<User | null>(null); // アプリケーションのプロフィールUser
  const [posts, setPosts] = useState<Post[]>([]);
  const [playlistPosts, setPlaylistPosts] = useState<Post[]>([]);
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playlistLoading, setPlaylistLoading] = useState(false);
  const [savedLoading, setSavedLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('posts');

  // プロフィールを取得
  const fetchProfile = useCallback(async () => {
    if (!user) {
      console.log('認証ユーザー情報がありません');
      setLoading(false);
      return;
    }

    try {
      console.log('=== マイページ: プロフィールとフォロー数を取得中 ===');
      console.log('認証ユーザーID:', user.id);

      // プロフィール、フォロワー数、フォロー中の数を並列取得
      const [profileResult, followersResult, followingResult] = await Promise.all([
        getUserProfile(user.id),
        getFollowersCount(user.id),
        getFollowingCount(user.id),
      ]);

      if (profileResult.error) {
        console.error('プロフィール取得エラー:', profileResult.error);
        window.alert('エラー: プロフィールの取得に失敗しました');
        return;
      }

      if (profileResult.data) {
        console.log('取得したプロフィール:', profileResult.data);
        setProfile(profileResult.data);
      }

      // フォロー数を設定（エラーがあっても0として扱う）
      setFollowersCount(followersResult.count);
      setFollowingCount(followingResult.count);
      console.log('フォロワー数:', followersResult.count);
      console.log('フォロー中:', followingResult.count);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  }, [user]);

  // 投稿を取得
  const fetchPosts = useCallback(async () => {
    if (!user) {
      console.log('ユーザー情報がありません');
      return;
    }

    try {
      console.log('=== マイページ: 投稿を取得中 ===');
      console.log('ユーザーID:', user.id);

      const { data, error } = await getUserPosts(user.id, user.id, 50);

      if (error) {
        console.error('投稿取得エラー:', error);
        window.alert('エラー: 投稿の取得に失敗しました');
        return;
      }

      if (data) {
        console.log('取得した投稿数:', data.length);
        setPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch user posts:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  }, [user]);

  // プレイリスト投稿を取得
  const fetchPlaylists = useCallback(async () => {
    if (playlistPosts.length > 0) return; // 既に取得済み

    setPlaylistLoading(true);
    try {
      console.log('=== マイページ: プレイリスト投稿をフィルタリング中 ===');
      const playlists = posts.filter((post) => post.contentType === 'playlist');
      console.log('プレイリスト投稿数:', playlists.length);
      setPlaylistPosts(playlists);
    } catch (error) {
      console.error('Failed to filter playlist posts:', error);
    } finally {
      setPlaylistLoading(false);
    }
  }, [posts, playlistPosts.length]);

  // 保存済み投稿を取得
  const fetchSavedPosts = useCallback(async () => {
    if (!user || savedPosts.length > 0) return; // 既に取得済み

    setSavedLoading(true);
    try {
      console.log('=== マイページ: 保存済み投稿を取得中 ===');
      console.log('ユーザーID:', user.id);

      const { data, error } = await getSavedPosts(user.id, user.id, 50);

      if (error) {
        console.error('保存済み投稿取得エラー:', error);
        window.alert('エラー: 保存済み投稿の取得に失敗しました');
        return;
      }

      if (data) {
        console.log('保存済み投稿数:', data.length);
        setSavedPosts(data);
      }
    } catch (error) {
      console.error('Failed to fetch saved posts:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setSavedLoading(false);
    }
  }, [user, savedPosts.length]);

  // 初回ロード（プロフィールと投稿を並行取得）
  useEffect(() => {
    const loadData = async () => {
      await Promise.all([fetchProfile(), fetchPosts()]);
      setLoading(false);
    };

    loadData();
  }, [fetchProfile, fetchPosts]);

  // リフレッシュ処理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchProfile(), fetchPosts()]);
    setRefreshing(false);
  }, [fetchProfile, fetchPosts]);

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleEditPress = () => {
    navigation.navigate('EditProfile');
  };

  const handleFollowersPress = () => {
    if (user?.id && profile) {
      navigation.navigate('Followers', {
        userId: user.id,
        username: profile.username
      });
    }
  };

  const handleFollowingPress = () => {
    if (user?.id && profile) {
      navigation.navigate('Following', {
        userId: user.id,
        username: profile.username
      });
    }
  };

  // タブ切り替えハンドラ（遅延ロード）
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'playlists' && playlistPosts.length === 0) {
      fetchPlaylists();
    } else if (tab === 'saved' && savedPosts.length === 0) {
      fetchSavedPosts();
    }
  };

  // ユーザーが未ログインの場合
  if (!user) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>ログインが必要です</Text>
      </View>
    );
  }

  // ローディング中（プロフィールまたは投稿を取得中）
  if (loading || !profile) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダーバー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Text style={styles.headerIconText}>👤</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{profile?.displayName || 'Music Like'}</Text>
        <TouchableOpacity style={styles.headerIcon} activeOpacity={0.7}>
          <Text style={styles.headerIconText}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* プロフィールヘッダー */}
        <ProfileHeader user={profile} onEditPress={handleEditPress} />

        {/* 統計情報 */}
        <ProfileStats
          postsCount={posts.length}
          followersCount={followersCount}
          followingCount={followingCount}
          onFollowersPress={handleFollowersPress}
          onFollowingPress={handleFollowingPress}
        />

        {/* タブ */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('posts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              投稿
            </Text>
            {activeTab === 'posts' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('playlists')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'playlists' && styles.tabTextActive]}>
              プレイリスト
            </Text>
            {activeTab === 'playlists' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.tab}
            onPress={() => handleTabChange('saved')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'saved' && styles.tabTextActive]}>
              保存
            </Text>
            {activeTab === 'saved' && <View style={styles.tabIndicator} />}
          </TouchableOpacity>
        </View>

        {/* コンテンツ */}
        {activeTab === 'posts' && <PostGrid posts={posts} onPostPress={handlePostPress} />}

        {activeTab === 'playlists' &&
          (playlistLoading ? (
            <View style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <PostGrid posts={playlistPosts} onPostPress={handlePostPress} />
          ))}

        {activeTab === 'saved' &&
          (savedLoading ? (
            <View style={[styles.container, styles.centerContent]}>
              <ActivityIndicator size="large" color={Colors.primary} />
            </View>
          ) : (
            <PostGrid posts={savedPosts} onPostPress={handlePostPress} />
          ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIconText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    color: Colors.white,
  },
  tabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: Colors.primary,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
  },
});
