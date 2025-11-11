import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { PlaylistTrack } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';

interface PlaylistTrackItemProps {
  playlistTrack: PlaylistTrack;
  position: number;
  isOwner: boolean;
  isEditMode: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  isFirst?: boolean;
  isLast?: boolean;
}

export const PlaylistTrackItem: React.FC<PlaylistTrackItemProps> = ({
  playlistTrack,
  position,
  isOwner,
  isEditMode,
  onMoveUp,
  onMoveDown,
  onDelete,
  isFirst = false,
  isLast = false,
}) => {
  const { track } = playlistTrack;

  if (!track) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Position番号 */}
      <View style={styles.positionContainer}>
        <Text style={styles.positionText}>{position + 1}</Text>
      </View>

      {/* サムネイル */}
      <View style={styles.thumbnailContainer}>
        {track.thumbnailUrl ? (
          <Image source={{ uri: track.thumbnailUrl }} style={styles.thumbnail} />
        ) : (
          <View style={styles.thumbnailPlaceholder}>
            <Text style={styles.placeholderIcon}>🎵</Text>
          </View>
        )}
      </View>

      {/* 曲情報 */}
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {track.title}
        </Text>
        <Text style={styles.artist} numberOfLines={1}>
          {track.artist}
          {track.album && ` • ${track.album}`}
        </Text>
        {track.service && track.service !== 'manual' && (
          <Text style={styles.service}>
            {track.service === 'spotify' && '🎵 Spotify'}
            {track.service === 'apple_music' && '🍎 Apple Music'}
            {track.service === 'youtube_music' && '▶️ YouTube Music'}
          </Text>
        )}
      </View>

      {/* 編集モードのコントロール（所有者のみ） */}
      {isOwner && isEditMode && (
        <View style={styles.controlsContainer}>
          {/* 並び替えボタン */}
          <View style={styles.reorderButtons}>
            <TouchableOpacity
              style={[styles.reorderButton, isFirst && styles.reorderButtonDisabled]}
              onPress={onMoveUp}
              disabled={isFirst}
              activeOpacity={0.7}
            >
              <Text style={[styles.reorderIcon, isFirst && styles.reorderIconDisabled]}>
                ▲
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.reorderButton, isLast && styles.reorderButtonDisabled]}
              onPress={onMoveDown}
              disabled={isLast}
              activeOpacity={0.7}
            >
              <Text style={[styles.reorderIcon, isLast && styles.reorderIconDisabled]}>
                ▼
              </Text>
            </TouchableOpacity>
          </View>

          {/* 削除ボタン */}
          <TouchableOpacity
            style={styles.deleteButton}
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Text style={styles.deleteIcon}>🗑️</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  positionContainer: {
    width: 30,
    marginRight: Spacing.sm,
  },
  positionText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.medium,
    color: '#808080',
    textAlign: 'center',
  },
  thumbnailContainer: {
    marginRight: Spacing.md,
  },
  thumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
  },
  thumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 24,
  },
  infoContainer: {
    flex: 1,
  },
  title: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: 4,
  },
  artist: {
    fontSize: Typography.fontSize.sm,
    color: '#B0B0B0',
    marginBottom: 2,
  },
  service: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  reorderButtons: {
    marginRight: Spacing.sm,
  },
  reorderButton: {
    width: 32,
    height: 20,
    backgroundColor: '#2A2A2A',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  reorderButtonDisabled: {
    backgroundColor: '#1A1A1A',
  },
  reorderIcon: {
    fontSize: 12,
    color: Colors.white,
  },
  reorderIconDisabled: {
    color: '#404040',
  },
  deleteButton: {
    width: 36,
    height: 36,
    backgroundColor: '#3A1A1A',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteIcon: {
    fontSize: 18,
  },
});
