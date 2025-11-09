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

  const renderItem = ({ item, index }: { item: Post; index: number }) => {
    // タイトルを取得（プレイリスト、トラック、またはキャプション）
    const title =
      item.playlistTitle ||
      item.trackTitle ||
      (item.caption ? item.caption.substring(0, 30) : 'Untitled');

    return (
      <View style={styles.gridItem}>
        <TouchableOpacity
          style={styles.gridTouchable}
          onPress={() => handlePostPress(item.id)}
          activeOpacity={0.7}
        >
          {/* サムネイル */}
          <View style={styles.thumbnail}>
            {/* 再生ボタン */}
            <View style={styles.playButton}>
              <Text style={styles.playIcon}>▶</Text>
            </View>
            {/* 番号アイコン（左下） */}
            <View style={styles.numberBadge}>
              <Text style={styles.numberText}>{index + 1}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* タイトル */}
        <Text style={styles.titleText} numberOfLines={2}>
          {title}
        </Text>
      </View>
    );
  };

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
    marginBottom: Spacing.base,
    paddingHorizontal: SPACING,
  },
  gridItem: {
    width: ITEM_SIZE,
    marginHorizontal: SPACING / 2,
  },
  gridTouchable: {
    width: '100%',
    aspectRatio: 1,
    marginBottom: Spacing.xs,
  },
  thumbnail: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    position: 'relative',
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 20,
    color: '#000000',
    marginLeft: 4,
  },
  numberBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  numberText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  titleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    lineHeight: 14,
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
