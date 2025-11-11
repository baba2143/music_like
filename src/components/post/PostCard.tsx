import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Post } from '../../types/models';
import { UserAvatar } from '../common/UserAvatar';
import { getRelativeTime } from '../../utils/mockData';
import { Colors, Typography, Spacing, BorderRadius, Shadow } from '../../config/theme';
import { PostMenu } from './PostMenu';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { deletePost } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';

interface PostCardProps {
  post: Post;
  onLike: (postId: string) => void;
  onComment: (postId: string) => void;
  onSave: (postId: string) => void;
  onPressUser: (userId: string) => void;
  onPressPost: (postId: string) => void;
  onPostDeleted?: () => void;
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onSave,
  onPressUser,
  onPressPost,
  onPostDeleted,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const [menuVisible, setMenuVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = user?.id === post.userId;

  const handleOpenPlaylist = () => {
    if (post.playlistUrl) {
      Linking.openURL(post.playlistUrl);
    }
  };

  const handleEdit = () => {
    navigation.navigate('EditPost', { postId: post.id });
  };

  const handleDeleteConfirm = async () => {
    if (!user) return;

    setDeleting(true);
    try {
      const { error } = await deletePost(post.id);

      if (error) {
        console.error('投稿削除エラー:', error);
        window.alert('エラー: 投稿の削除に失敗しました');
        return;
      }

      setDeleteDialogVisible(false);
      onPostDeleted?.();
      window.alert('投稿を削除しました');
    } catch (error) {
      console.error('Failed to delete post:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setDeleting(false);
    }
  };

  const renderPlaylistContent = () => {
    if (post.contentType !== 'playlist') return null;

    return (
      <View style={styles.playlistCard}>
        {post.playlistThumbnail && (
          <Image source={{ uri: post.playlistThumbnail }} style={styles.playlistThumbnail} />
        )}
        <View style={styles.playlistInfo}>
          <Text style={styles.playlistTitle} numberOfLines={2}>
            {post.playlistTitle}
          </Text>
          <Text style={styles.playlistMeta}>
            {post.playlistTrackCount}曲 •{' '}
            {post.playlistService === 'spotify'
              ? 'Spotify'
              : post.playlistService === 'apple_music'
              ? 'Apple Music'
              : 'YouTube Music'}
          </Text>
          <TouchableOpacity style={styles.openButton} onPress={handleOpenPlaylist}>
            <Text style={styles.openButtonText}>
              {post.playlistService === 'spotify'
                ? 'Spotifyで開く'
                : post.playlistService === 'apple_music'
                ? 'Apple Musicで開く'
                : 'YouTube Musicで開く'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTrackContent = () => {
    if (post.contentType !== 'track') return null;

    return (
      <View style={styles.trackCard}>
        {post.trackThumbnail && (
          <Image source={{ uri: post.trackThumbnail }} style={styles.trackThumbnail} />
        )}
        <View style={styles.trackInfo}>
          <Text style={styles.trackTitle} numberOfLines={1}>
            {post.trackTitle}
          </Text>
          <Text style={styles.trackArtist} numberOfLines={1}>
            {post.trackArtist}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPressPost(post.id)}
      activeOpacity={0.95}
    >
      {/* ヘッダー */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => onPressUser(post.userId)}
        activeOpacity={0.7}
      >
        <UserAvatar avatarUrl={post.author.avatarUrl} size="medium" />
        <View style={styles.headerText}>
          <Text style={styles.username}>@{post.author.username}</Text>
          <Text style={styles.timestamp}>{getRelativeTime(post.createdAt)}</Text>
        </View>
        {isOwnPost && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              setMenuVisible(true);
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.menuIcon}>⋯</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>

      {/* キャプション */}
      {post.caption && (
        <Text style={styles.caption} numberOfLines={3}>
          {post.caption}
        </Text>
      )}

      {/* コンテンツ */}
      {post.contentType === 'playlist' && renderPlaylistContent()}
      {post.contentType === 'track' && renderTrackContent()}

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

      {/* フッター */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onLike(post.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, post.isLiked && styles.actionIconActive]}>
            {post.isLiked ? '❤️' : '🤍'}
          </Text>
          <Text style={styles.actionCount}>{post.likesCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onComment(post.id)}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>💬</Text>
          <Text style={styles.actionCount}>{post.commentsCount}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => onSave(post.id)}
          activeOpacity={0.7}
        >
          <Text style={[styles.actionIcon, post.isSaved && styles.actionIconActive]}>
            {post.isSaved ? '🔖' : '📑'}
          </Text>
          <Text style={styles.actionCount}>保存</Text>
        </TouchableOpacity>
      </View>

      {/* メニューとダイアログ */}
      <PostMenu
        visible={menuVisible}
        onClose={() => setMenuVisible(false)}
        onEdit={handleEdit}
        onDelete={() => {
          setDeleteDialogVisible(true);
        }}
      />

      <DeleteConfirmDialog
        visible={deleteDialogVisible}
        onClose={() => setDeleteDialogVisible(false)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1A1A1A', // 濃いグレー背景
    marginBottom: Spacing.md,
    paddingVertical: Spacing.base,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  headerText: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white, // 白文字
  },
  timestamp: {
    fontSize: Typography.fontSize.sm,
    color: '#808080', // グレー文字
    marginTop: 2,
  },
  menuButton: {
    padding: Spacing.xs,
  },
  menuIcon: {
    fontSize: Typography.fontSize.xl,
    color: '#B0B0B0', // 明るいグレー
  },
  caption: {
    fontSize: Typography.fontSize.base,
    color: Colors.white, // 白文字
    lineHeight: Typography.fontSize.base * Typography.lineHeight.normal,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  playlistCard: {
    backgroundColor: '#2A2A2A', // さらに濃いグレー
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  playlistThumbnail: {
    flex: 1,
    height: 180,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.sm,
  },
  playlistInfo: {
    gap: Spacing.xs,
  },
  playlistTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white, // 白文字
  },
  playlistMeta: {
    fontSize: Typography.fontSize.sm,
    color: '#B0B0B0', // 明るいグレー
  },
  openButton: {
    backgroundColor: Colors.primary, // ピンク
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  openButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  trackCard: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A', // さらに濃いグレー
    borderRadius: BorderRadius.base,
    padding: Spacing.md,
    marginHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  trackThumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
  },
  trackInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  trackTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white, // 白文字
    marginBottom: Spacing.xs,
  },
  trackArtist: {
    fontSize: Typography.fontSize.base,
    color: '#B0B0B0', // 明るいグレー
  },
  hashtags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  hashtag: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary, // ピンク
    marginRight: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.sm,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  actionIcon: {
    fontSize: Typography.fontSize.lg,
    marginRight: Spacing.xs,
  },
  actionIconActive: {
    transform: [{ scale: 1.1 }],
  },
  actionCount: {
    fontSize: Typography.fontSize.sm,
    color: '#B0B0B0', // 明るいグレー
    fontWeight: Typography.fontWeight.medium,
  },
});
