import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { Playlist } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';
import { InternalPlaylistCard } from './InternalPlaylistCard';
import { getUserPlaylists } from '../../services/playlistService';

interface PlaylistSelectorProps {
  userId: string;
  selectedPlaylist: Playlist | null;
  onSelect: (playlist: Playlist) => void;
}

export const PlaylistSelector: React.FC<PlaylistSelectorProps> = ({
  userId,
  selectedPlaylist,
  onSelect,
}) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlaylists = async () => {
      setLoading(true);
      const { data, error } = await getUserPlaylists(userId, userId);

      if (error) {
        console.error('Failed to fetch playlists:', error);
        setError('プレイリストの取得に失敗しました');
        setLoading(false);
        return;
      }

      setPlaylists(data);
      setLoading(false);
    };

    fetchPlaylists();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (playlists.length === 0) {
    return (
      <View style={styles.centerContent}>
        <Text style={styles.emptyIcon}>🎵</Text>
        <Text style={styles.emptyText}>プレイリストがありません</Text>
        <Text style={styles.emptySubtext}>先にプレイリストを作成してください</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>プレイリストを選択</Text>
      {playlists.map((playlist) => (
        <InternalPlaylistCard
          key={playlist.id}
          playlist={playlist}
          isSelected={selectedPlaylist?.id === playlist.id}
          onPress={onSelect}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  errorText: {
    fontSize: Typography.fontSize.md,
    color: Colors.error,
    textAlign: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.md,
    color: '#808080',
    textAlign: 'center',
  },
});
