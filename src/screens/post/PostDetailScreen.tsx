import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Post, Comment } from '../../types/models';
import { CommentCard } from '../../components/post/CommentCard';
import { CommentInput } from '../../components/post/CommentInput';
import { PostMenu } from '../../components/post/PostMenu';
import { DeleteConfirmDialog } from '../../components/post/DeleteConfirmDialog';
import { Colors, Typography, Spacing } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPost,
  getPostComments,
  createComment,
  toggleLike,
  toggleSave,
  deletePost,
} from '../../services/postService';
import { HomeStackParamList } from '../../navigation/RootNavigator';
import { getRelativeTime } from '../../utils/mockData';

type PostDetailScreenRouteProp = RouteProp<HomeStackParamList, 'PostDetail'>;
type NavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PostDetailScreenRouteProp>();
  const { user } = useAuth();
  const { postId } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = user?.id === post?.userId;

  // 投稿データを取得
  const fetchPost = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await getPost(postId, user?.id);

      if (error) {
        console.error('投稿取得エラー:', error);
        window.alert('エラー: 投稿の取得に失敗しました');
        navigation.goBack();
        return;
      }

      if (data) {
        setPost(data);
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  }, [postId, user, navigation]);

  // コメント一覧を取得
  const fetchComments = useCallback(async () => {
    try {
      setCommentsLoading(true);
      const { data, error } = await getPostComments(postId);

      if (error) {
        console.error('コメント取得エラー:', error);
        return;
      }

      if (data) {
        setComments(data);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  }, [postId]);

  // 初回ロード
  useEffect(() => {
    fetchPost();
    fetchComments();
  }, [fetchPost, fetchComments]);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = async () => {
    if (!user || !post) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      const { isLiked, error } = await toggleLike(post.id, user.id);

      if (error) {
        console.error('いいねエラー:', error);
        window.alert('エラー: いいねに失敗しました');
        return;
      }

      // ローカルステートを更新
      setPost({
        ...post,
        isLiked,
        likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  };

  const handleSave = async () => {
    if (!user || !post) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      const { isSaved, error } = await toggleSave(post.id, user.id);

      if (error) {
        console.error('保存エラー:', error);
        window.alert('エラー: 保存に失敗しました');
        return;
      }

      // ローカルステートを更新
      setPost({
        ...post,
        isSaved,
        savesCount: isSaved ? post.savesCount + 1 : post.savesCount - 1,
      });
    } catch (error) {
      console.error('Failed to toggle save:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  };

  const handleCommentSubmit = async (content: string) => {
    if (!user || !post) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      setSubmittingComment(true);
      const { data, error } = await createComment(post.id, user.id, content);

      if (error) {
        console.error('コメント投稿エラー:', error);
        window.alert('エラー: コメントの投稿に失敗しました');
        return;
      }

      if (data) {
        // コメントリストの先頭に追加
        setComments([data, ...comments]);
        // 投稿のコメント数を更新
        setPost({
          ...post,
          commentsCount: post.commentsCount + 1,
        });
      }
    } catch (error) {
      console.error('Failed to create comment:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setSubmittingComment(false);
    }
  };

  const handlePlaylistPress = () => {
    if (post?.playlistUrl) {
      Linking.openURL(post.playlistUrl);
    } else if (post?.trackUrl) {
      Linking.openURL(post.trackUrl);
    }
  };

  const handleEdit = () => {
    if (!post) return;
    // @ts-ignore - EditPost is in RootStack, need to navigate to parent
    navigation.getParent()?.navigate('EditPost', { postId: post.id });
  };

  const handleDeleteConfirm = async () => {
    if (!user || !post) return;

    setDeleting(true);
    try {
      const { error } = await deletePost(post.id);

      if (error) {
        console.error('投稿削除エラー:', error);
        window.alert('エラー: 投稿の削除に失敗しました');
        return;
      }

      setDeleteDialogVisible(false);
      window.alert('投稿を削除しました');
      navigation.goBack();
    } catch (error) {
      console.error('Failed to delete post:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  const handlePressUser = useCallback(
    (userId: string) => {
      navigation.navigate('UserProfile', { userId });
    },
    [navigation]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>投稿が見つかりませんでした</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>投稿</Text>
        {isOwnPost ? (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backButton} />
        )}
      </View>

      {/* スクロール可能なコンテンツ */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* プレイリスト/トラック情報 */}
        {(post.contentType === 'playlist' || post.contentType === 'track') && (
          <TouchableOpacity
            style={styles.playlistSection}
            onPress={handlePlaylistPress}
            activeOpacity={0.8}
          >
            {/* サムネイル */}
            <View style={styles.thumbnail}>
              {post.playlistThumbnail || post.trackThumbnail ? (
                <Image
                  source={{ uri: post.playlistThumbnail || post.trackThumbnail || '' }}
                  style={styles.thumbnailImage}
                />
              ) : (
                <View style={styles.placeholderImage}>
                  <Text style={styles.placeholderText}>🎵</Text>
                </View>
              )}
            </View>

            {/* プレイリスト/トラック詳細 */}
            <View style={styles.playlistInfo}>
              <Text style={styles.playlistTitle}>
                {post.playlistTitle || post.trackTitle}
              </Text>
              {post.contentType === 'playlist' ? (
                <Text style={styles.playlistDetails}>
                  {post.playlistTrackCount}曲 ·{' '}
                  {post.playlistService === 'spotify'
                    ? 'Spotify'
                    : post.playlistService === 'apple_music'
                    ? 'Apple Music'
                    : 'YouTube Music'}
                </Text>
              ) : (
                <Text style={styles.playlistDetails}>{post.trackArtist}</Text>
              )}
            </View>
          </TouchableOpacity>
        )}

        {/* 投稿者情報 */}
        <View style={styles.postInfo}>
          {/* ユーザー */}
          <TouchableOpacity
            style={styles.userInfo}
            onPress={() => handlePressUser(post.userId)}
            activeOpacity={0.7}
          >
            <View style={styles.avatar}>
              {post.author.avatarUrl ? (
                <Image source={{ uri: post.author.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {post.author.username.charAt(0).toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.username}>@{post.author.username}</Text>
              <Text style={styles.timestamp}>{getRelativeTime(post.createdAt)}</Text>
            </View>
          </TouchableOpacity>

          {/* キャプション */}
          {post.caption && <Text style={styles.caption}>{post.caption}</Text>}

          {/* ハッシュタグ */}
          {post.hashtags && post.hashtags.length > 0 && (
            <View style={styles.hashtags}>
              {post.hashtags.map((tag) => (
                <Text key={tag} style={styles.hashtag}>
                  #{tag}{' '}
                </Text>
              ))}
            </View>
          )}

          {/* アクションボタン */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike} activeOpacity={0.7}>
              <Text style={[styles.actionIcon, post.isLiked && styles.actionIconActive]}>
                {post.isLiked ? '❤️' : '🤍'}
              </Text>
              <Text style={styles.actionCount}>{post.likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionCount}>{post.commentsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSave} activeOpacity={0.7}>
              <Text style={[styles.actionIcon, post.isSaved && styles.actionIconActive]}>
                {post.isSaved ? '🔖' : '📑'}
              </Text>
              <Text style={styles.actionCount}>保存</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* コメント一覧 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>コメント ({comments.length})</Text>
          {commentsLoading ? (
            <View style={styles.commentsLoading}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : comments.length === 0 ? (
            <View style={styles.emptyComments}>
              <Text style={styles.emptyCommentsText}>まだコメントはありません</Text>
            </View>
          ) : (
            comments.map((comment) => <CommentCard key={comment.id} comment={comment} />)
          )}
        </View>
      </ScrollView>

      {/* コメント入力 */}
      <CommentInput onSubmit={handleCommentSubmit} />

      {/* メニューとダイアログ */}
      <PostMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={() => setDeleteDialogVisible(true)}
      />

      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  menuButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: Typography.fontSize.xl,
    color: '#B0B0B0',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  playlistSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  thumbnail: {
    flex: 1,
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  thumbnailImage: {
    flex: 1,
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  placeholderText: {
    fontSize: 80,
  },
  playlistInfo: {
    gap: Spacing.xs,
  },
  playlistTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  playlistDetails: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  postInfo: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
    overflow: 'hidden',
  },
  avatarImage: {
    flex: 1,
  },
  avatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  caption: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.md,
  },
  hashtag: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    marginRight: Spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionIconActive: {
    transform: [{ scale: 1.1 }],
  },
  actionCount: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  commentsSection: {
    paddingTop: Spacing.md,
  },
  commentsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  commentsLoading: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyComments: {
    paddingVertical: Spacing.xl,
    alignItems: 'center',
  },
  emptyCommentsText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
});
