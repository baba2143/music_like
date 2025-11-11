import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Playlist } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistPress?: (playlistId: string) => void;
}

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 3;
const SPACING = 2;
const ITEM_SIZE = (width - SPACING * (COLUMN_COUNT + 1)) / COLUMN_COUNT;

export const PlaylistGrid: React.FC<PlaylistGridProps> = ({ playlists, onPlaylistPress }) => {
  const handlePlaylistPress = (playlistId: string) => {
    if (onPlaylistPress) {
      onPlaylistPress(playlistId);
    }
  };

  const renderItem = ({ item, index }: { item: Playlist; index: number }) => {
    return (
      <View style={styles.gridItem}>
        <TouchableOpacity
          style={styles.gridTouchable}
          onPress={() => handlePlaylistPress(item.id)}
          activeOpacity={0.7}
        >
          {/* カバー画像 */}
          <View style={styles.cover}>
            {item.coverImageUrl ? (
              <Image source={{ uri: item.coverImageUrl }} style={styles.coverImage} />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderIcon}>🎵</Text>
              </View>
            )}

            {/* 曲数バッジ（右下） */}
            <View style={styles.trackCountBadge}>
              <Text style={styles.trackCountText}>{item.tracksCount}曲</Text>
            </View>

            {/* 公開/非公開バッジ（左上） */}
            <View style={[styles.visibilityBadge, !item.isPublic && styles.privateBadge]}>
              <Text style={styles.visibilityText}>{item.isPublic ? '公開' : '非公開'}</Text>
            </View>
          </View>
        </TouchableOpacity>
        {/* タイトル */}
        <Text style={styles.titleText} numberOfLines={2}>
          {item.title}
        </Text>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎵</Text>
      <Text style={styles.emptyText}>プレイリストがありません</Text>
      <Text style={styles.emptySubtext}>最初のプレイリストを作成しましょう！</Text>
    </View>
  );

  return (
    <FlatList
      data={playlists}
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
    flex: 1,
    aspectRatio: 1,
    marginBottom: Spacing.xs,
  },
  cover: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
    overflow: 'hidden',
  },
  coverImage: {
    position: 'absolute',
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
  },
  placeholderImage: {
    position: 'absolute',
    flex: 1,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  placeholderIcon: {
    fontSize: 40,
  },
  trackCountBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  trackCountText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  visibilityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: Colors.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  privateBadge: {
    backgroundColor: '#808080',
  },
  visibilityText: {
    fontSize: 10,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  titleText: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    lineHeight: 14,
    fontWeight: Typography.fontWeight.medium,
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
