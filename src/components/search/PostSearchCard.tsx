import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Post } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface PostSearchCardProps {
  post: Post;
  onPress?: (postId: string) => void;
}

export const PostSearchCard: React.FC<PostSearchCardProps> = ({ post, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(post.id);
    } else {
      Alert.alert('準備中', '投稿詳細表示機能は準備中です');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      {/* サムネイル */}
      <View style={styles.thumbnail}>
        <View style={styles.thumbnailPlaceholder}>
          <Text style={styles.thumbnailIcon}>🎵</Text>
        </View>
      </View>

      {/* 投稿情報 */}
      <View style={styles.postInfo}>
        {/* プレイリストタイトル/曲名 */}
        <Text style={styles.title} numberOfLines={1}>
          {post.playlistTitle || post.songTitle || 'タイトルなし'}
        </Text>

        {/* サブ情報 */}
        <Text style={styles.subtitle} numberOfLines={1}>
          {post.contentType === 'playlist' && post.playlistTrackCount && (
            <Text>{post.playlistTrackCount}曲</Text>
          )}
          {post.contentType === 'playlist' && post.playlistService && (
            <Text> · {post.playlistService}</Text>
          )}
          {post.contentType === 'song' && post.songArtist && <Text>{post.songArtist}</Text>}
        </Text>

        {/* 投稿者 */}
        <Text style={styles.author} numberOfLines={1}>
          @{post.author.username}
        </Text>
      </View>

      {/* 統計情報 */}
      <View style={styles.stats}>
        <View style={styles.statRow}>
          <Text style={styles.statIcon}>♡</Text>
          <Text style={styles.statText}>{post.likesCount}</Text>
        </View>
        <View style={styles.statRow}>
          <Text style={styles.statIcon}>💬</Text>
          <Text style={styles.statText}>{post.commentsCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  thumbnail: {
    marginRight: Spacing.md,
  },
  thumbnailPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 24,
  },
  postInfo: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  title: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginBottom: Spacing.xs,
  },
  author: {
    fontSize: Typography.fontSize.xs,
    color: '#606060',
  },
  stats: {
    alignItems: 'flex-end',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  statIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  statText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
});
