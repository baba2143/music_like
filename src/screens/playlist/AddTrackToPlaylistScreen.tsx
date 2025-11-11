import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../config/theme';
import { ProfileStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { searchTracks, createOrGetTrack } from '../../services/trackService';
import { addTrackToPlaylist } from '../../services/playlistService';
import { Track } from '../../types/models';
import { fetchMusicMetadata, detectMusicService } from '../../services/musicMetadataService';

type AddTrackScreenRouteProp = RouteProp<ProfileStackParamList, 'AddTrack'>;
type AddTrackScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'AddTrack'
>;

type TabType = 'search' | 'external';

export const AddTrackToPlaylistScreen: React.FC = () => {
  const navigation = useNavigation<AddTrackScreenNavigationProp>();
  const route = useRoute<AddTrackScreenRouteProp>();
  const { user } = useAuth();
  const { playlistId } = route.params;

  const [activeTab, setActiveTab] = useState<TabType>('search');

  // 検索タブの状態
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [searching, setSearching] = useState(false);

  // 外部サービスタブの状態
  const [externalUrl, setExternalUrl] = useState('');
  const [fetchedTrack, setFetchedTrack] = useState<Track | null>(null);
  const [fetching, setFetching] = useState(false);

  // 編集可能なメタデータ
  const [editableTitle, setEditableTitle] = useState('');
  const [editableArtist, setEditableArtist] = useState('');

  // 曲追加中の状態
  const [adding, setAdding] = useState(false);

  // 検索実行
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      window.alert('検索ワードを入力してください');
      return;
    }

    setSearching(true);
    const { data, error } = await searchTracks(searchQuery, 50);
    setSearching(false);

    if (error) {
      console.error('Failed to search tracks:', error);
      window.alert('エラー: 曲の検索に失敗しました');
      return;
    }

    setSearchResults(data);
  };

  // 外部URLから曲情報を取得
  const handleFetchExternal = async () => {
    if (!externalUrl.trim()) {
      window.alert('URLを入力してください');
      return;
    }

    const service = detectMusicService(externalUrl);
    if (!service) {
      window.alert('Spotify、Apple Music、YouTube Musicのリンクのみサポート');
      return;
    }

    setFetching(true);
    const { data, error } = await fetchMusicMetadata(externalUrl);
    setFetching(false);

    if (error || !data) {
      console.error('Failed to fetch track metadata:', error);
      window.alert('エラー: 曲情報の取得に失敗しました');
      return;
    }

    // Trackオブジェクトを作成
    const track: Track = {
      id: '', // まだ作成されていない
      title: data.title || '不明',
      artist: data.artist || '不明',
      album: data.album,
      thumbnailUrl: data.thumbnailUrl,
      externalUrl: externalUrl,
      service: service,
      externalId: extractExternalId(externalUrl, service),
      createdAt: new Date(),
    };

    setFetchedTrack(track);
    // 編集可能なフィールドを初期化
    setEditableTitle(data.title || '');
    setEditableArtist(data.artist || '');
  };

  // 外部IDを抽出
  const extractExternalId = (
    url: string,
    service: 'spotify' | 'apple_music' | 'youtube_music'
  ): string | undefined => {
    try {
      if (service === 'spotify') {
        const match = url.match(/track\/([a-zA-Z0-9]+)/);
        return match ? match[1] : undefined;
      } else if (service === 'apple_music') {
        const match = url.match(/\/i=(\d+)/);
        return match ? match[1] : undefined;
      } else if (service === 'youtube_music') {
        const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/);
        return match ? match[1] : undefined;
      }
    } catch (error) {
      console.error('Failed to extract external ID:', error);
    }
    return undefined;
  };

  // 既存の曲をプレイリストに追加
  const handleAddExistingTrack = async (track: Track) => {
    if (!user) {
      window.alert('ログインが必要です');
      return;
    }

    setAdding(true);
    const { data, error } = await addTrackToPlaylist(playlistId, track.id, user.id);
    setAdding(false);

    if (error) {
      console.error('Failed to add track to playlist:', error);
      window.alert('エラー: 曲の追加に失敗しました');
      return;
    }

    if (data) {
      window.alert('曲を追加しました');
      navigation.goBack();
    }
  };

  // 外部サービスから取得した曲を追加
  const handleAddExternalTrack = async () => {
    if (!fetchedTrack || !user) {
      return;
    }

    // 編集された値を検証
    if (!editableTitle.trim()) {
      window.alert('曲名を入力してください');
      return;
    }

    if (!editableArtist.trim()) {
      window.alert('アーティスト名を入力してください');
      return;
    }

    setAdding(true);

    // 編集された値を使用して曲を作成または取得
    const { data: track, error: createError } = await createOrGetTrack(
      editableTitle.trim(),
      editableArtist.trim(),
      {
        album: fetchedTrack.album,
        thumbnailUrl: fetchedTrack.thumbnailUrl,
        externalUrl: fetchedTrack.externalUrl,
        service: fetchedTrack.service,
        externalId: fetchedTrack.externalId,
      }
    );

    if (createError || !track) {
      console.error('Failed to create/get track:', createError);
      window.alert('エラー: 曲の作成に失敗しました');
      setAdding(false);
      return;
    }

    // プレイリストに追加
    const { data, error } = await addTrackToPlaylist(playlistId, track.id, user.id);
    setAdding(false);

    if (error) {
      console.error('Failed to add track to playlist:', error);
      window.alert('エラー: 曲の追加に失敗しました');
      return;
    }

    if (data) {
      window.alert('曲を追加しました');
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.headerButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>曲を追加</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* タブ */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('search')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'search' && styles.tabTextActive]}>
            検索
          </Text>
          {activeTab === 'search' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.tab}
          onPress={() => setActiveTab('external')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'external' && styles.tabTextActive]}>
            外部サービス
          </Text>
          {activeTab === 'external' && <View style={styles.tabIndicator} />}
        </TouchableOpacity>
      </View>

      {/* 検索タブ */}
      {activeTab === 'search' && (
        <View style={styles.content}>
          {/* 検索バー */}
          <View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="曲名またはアーティスト名で検索"
              placeholderTextColor="#808080"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
            />
            <TouchableOpacity
              style={styles.searchButton}
              onPress={handleSearch}
              disabled={searching}
              activeOpacity={0.7}
            >
              <Text style={styles.searchButtonText}>
                {searching ? '検索中...' : '検索'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 検索結果 */}
          <ScrollView showsVerticalScrollIndicator={false}>
            {searchResults.map((track) => (
              <View key={track.id} style={styles.trackItem}>
                {track.thumbnailUrl ? (
                  <Image source={{ uri: track.thumbnailUrl }} style={styles.trackThumbnail} />
                ) : (
                  <View style={styles.trackThumbnailPlaceholder}>
                    <Text style={styles.placeholderIcon}>🎵</Text>
                  </View>
                )}
                <View style={styles.trackInfo}>
                  <Text style={styles.trackTitle} numberOfLines={1}>
                    {track.title}
                  </Text>
                  <Text style={styles.trackArtist} numberOfLines={1}>
                    {track.artist}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => handleAddExistingTrack(track)}
                  disabled={adding}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addButtonText}>追加</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* 外部サービスタブ */}
      {activeTab === 'external' && (
        <View style={styles.content}>
          {/* URL入力 */}
          <View style={styles.urlInput}>
            <TextInput
              style={styles.urlTextInput}
              placeholder="Spotify / Apple Music / YouTube Music のURL"
              placeholderTextColor="#808080"
              value={externalUrl}
              onChangeText={setExternalUrl}
              autoCapitalize="none"
            />
            <TouchableOpacity
              style={styles.fetchButton}
              onPress={handleFetchExternal}
              disabled={fetching}
              activeOpacity={0.7}
            >
              <Text style={styles.fetchButtonText}>
                {fetching ? '取得中...' : '取得'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 取得した曲のプレビュー */}
          {fetchedTrack && (
            <View style={styles.preview}>
              <Text style={styles.previewTitle}>取得した曲（編集可能）</Text>
              <View style={styles.previewContent}>
                {fetchedTrack.thumbnailUrl ? (
                  <Image
                    source={{ uri: fetchedTrack.thumbnailUrl }}
                    style={styles.previewThumbnail}
                  />
                ) : (
                  <View style={styles.previewThumbnailPlaceholder}>
                    <Text style={styles.placeholderIcon}>🎵</Text>
                  </View>
                )}
                <View style={styles.previewInfo}>
                  <View style={styles.editFieldContainer}>
                    <Text style={styles.editFieldLabel}>曲名</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editableTitle}
                      onChangeText={setEditableTitle}
                      placeholder="曲名を入力"
                      placeholderTextColor="#808080"
                    />
                  </View>
                  <View style={styles.editFieldContainer}>
                    <Text style={styles.editFieldLabel}>アーティスト</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editableArtist}
                      onChangeText={setEditableArtist}
                      placeholder="アーティスト名を入力"
                      placeholderTextColor="#808080"
                    />
                  </View>
                  {fetchedTrack.album && (
                    <Text style={styles.previewTrackAlbum}>{fetchedTrack.album}</Text>
                  )}
                </View>
              </View>
              <TouchableOpacity
                style={styles.addExternalButton}
                onPress={handleAddExternalTrack}
                disabled={adding}
                activeOpacity={0.7}
              >
                <Text style={styles.addExternalButtonText}>
                  {adding ? '追加中...' : 'プレイリストに追加'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerButton: {
    fontSize: 24,
    color: Colors.white,
    width: 40,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    fontSize: Typography.fontSize.md,
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
  content: {
    flex: 1,
    padding: Spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    marginRight: Spacing.sm,
  },
  searchButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    justifyContent: 'center',
  },
  searchButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  trackItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: Spacing.sm,
  },
  trackThumbnail: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  trackThumbnailPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  placeholderIcon: {
    fontSize: 24,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: 4,
  },
  trackArtist: {
    fontSize: Typography.fontSize.sm,
    color: '#B0B0B0',
  },
  addButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  urlInput: {
    marginBottom: Spacing.lg,
  },
  urlTextInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  fetchButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  fetchButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  preview: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: Spacing.md,
  },
  previewTitle: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.md,
  },
  previewContent: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  previewThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: Spacing.md,
  },
  previewThumbnailPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  editFieldContainer: {
    marginBottom: Spacing.sm,
  },
  editFieldLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginBottom: 4,
  },
  editInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: '#404040',
  },
  previewTrackTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: 4,
  },
  previewTrackArtist: {
    fontSize: Typography.fontSize.md,
    color: '#B0B0B0',
    marginBottom: 2,
  },
  previewTrackAlbum: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginTop: Spacing.sm,
  },
  addExternalButton: {
    backgroundColor: Colors.primary,
    padding: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  addExternalButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
