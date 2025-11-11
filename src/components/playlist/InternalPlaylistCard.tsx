import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet, Image } from 'react-native';
import { Playlist } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';

interface InternalPlaylistCardProps {
  playlist: Playlist;
  isSelected?: boolean;
  onPress: (playlist: Playlist) => void;
}

export const InternalPlaylistCard: React.FC<InternalPlaylistCardProps> = ({
  playlist,
  isSelected = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[styles.container, isSelected && styles.selectedContainer]}
      onPress={() => onPress(playlist)}
      activeOpacity={0.7}
    >
      <View style={styles.coverContainer}>
        {playlist.coverImageUrl ? (
          <Image source={{ uri: playlist.coverImageUrl }} style={styles.cover} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>🎵</Text>
          </View>
        )}
      </View>
      <View style={styles.infoContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {playlist.title}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {playlist.tracksCount}曲 • {playlist.isPublic ? '公開' : '非公開'}
        </Text>
      </View>
      {isSelected && (
        <View style={styles.checkmark}>
          <Text style={styles.checkmarkIcon}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: Spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedContainer: {
    borderColor: Colors.primary,
    backgroundColor: '#2A1A2A',
  },
  coverContainer: {
    marginRight: Spacing.md,
  },
  cover: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#D4C5B0',
  },
  placeholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 28,
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
  meta: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
});
