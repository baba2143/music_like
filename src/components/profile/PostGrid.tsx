import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Post } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface PostGridProps {
  posts: Post[];
  onPostPress?: (postId: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export const PostGrid: React.FC<PostGridProps> = ({ posts, onPostPress }) => {
  const handlePostPress = (postId: string) => {
    if (onPostPress) {
      onPostPress(postId);
    }
  };

  const renderItem = ({ item }: { item: Post }) => (
    <TouchableOpacity
      style={styles.gridItem}
      onPress={() => handlePostPress(item.id)}
      activeOpacity={0.7}
    >
      {/* サムネイル（プレースホルダー） */}
      <View style={styles.thumbnail}>
        <Text style={styles.thumbnailIcon}>🎵</Text>
      </View>

      {/* エンゲージメント情報 */}
      <View style={styles.overlay}>
        <View style={styles.engagementContainer}>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>♡</Text>
            <Text style={styles.engagementText}>{item.likesCount}</Text>
          </View>
          <View style={styles.engagementItem}>
            <Text style={styles.engagementIcon}>💬</Text>
            <Text style={styles.engagementText}>{item.commentsCount}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📱</Text>
      <Text style={styles.emptyText}>まだ投稿がありません</Text>
      <Text style={styles.emptySubtext}>最初の投稿を作成しましょう！</Text>
    </View>
  );

  return (
    <FlatList
      data={posts}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      numColumns={COLUMN_COUNT}
      columnWrapperStyle={styles.row}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={renderEmpty}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingTop: SPACING,
    flexGrow: 1,
  },
  row: {
    marginBottom: SPACING,
    paddingHorizontal: SPACING,
  },
  gridItem: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginHorizontal: SPACING / 2,
    position: 'relative',
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailIcon: {
    fontSize: 32,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  engagementContainer: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  engagementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  engagementIcon: {
    fontSize: 16,
  },
  engagementText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 3,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
  },
});
