import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Switch,
  Alert,
  Image,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, Typography } from '../../config/theme';
import { ProfileStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import {
  getPlaylist,
  updatePlaylist,
  deletePlaylist,
  removeTrackFromPlaylist,
  reorderPlaylistTracks,
} from '../../services/playlistService';
import { Playlist } from '../../types/models';
import { PlaylistTrackItem } from '../../components/playlist/PlaylistTrackItem';

type PlaylistDetailScreenRouteProp = RouteProp<ProfileStackParamList, 'PlaylistDetail'>;
type PlaylistDetailScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'PlaylistDetail'
>;

export const PlaylistDetailScreen: React.FC = () => {
  const navigation = useNavigation<PlaylistDetailScreenNavigationProp>();
  const route = useRoute<PlaylistDetailScreenRouteProp>();
  const { user } = useAuth();
  const { playlistId } = route.params;

  const [playlist, setPlaylist] = useState<Playlist | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isInitialMount = useRef(true);

  // 編集用の状態
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editIsPublic, setEditIsPublic] = useState(true);
  const [editCoverImageUrl, setEditCoverImageUrl] = useState<string | undefined>(undefined);
  const [showCoverSelector, setShowCoverSelector] = useState(false);

  // 所有者かどうか
  const isOwner = user?.id === playlist?.userId;

  // カバー画像URLを取得（優先順位: 編集中のURL → coverImageUrl → 1曲目のサムネイル）
  const getCoverImageUrl = (): string | undefined => {
    // 編集モード時は編集中のURLを優先
    if (isEditMode && editCoverImageUrl !== undefined) {
      return editCoverImageUrl || undefined;
    }
    if (playlist?.coverImageUrl) {
      return playlist.coverImageUrl;
    }
    if (playlist?.tracks && playlist.tracks.length > 0) {
      return playlist.tracks[0].track?.thumbnailUrl;
    }
    return undefined;
  };

  // プレイリストを取得
  const fetchPlaylist = useCallback(async () => {
    const { data, error } = await getPlaylist(playlistId, user?.id);

    if (error) {
      console.error('Failed to fetch playlist:', error);
      window.alert('エラー: プレイリストの取得に失敗しました');
      navigation.goBack();
      return;
    }

    if (data) {
      setPlaylist(data);
      setEditTitle(data.title);
      setEditDescription(data.description || '');
      setEditIsPublic(data.isPublic);
      setEditCoverImageUrl(data.coverImageUrl);
    }
  }, [playlistId, user?.id, navigation]);

  useEffect(() => {
    const loadPlaylist = async () => {
      await fetchPlaylist();
      setLoading(false);
    };

    loadPlaylist();
  }, [fetchPlaylist]);

  // 画面にフォーカスが戻ったときにプレイリストを再取得
  useFocusEffect(
    useCallback(() => {
      // 初回マウント時はスキップ（useEffectで処理済み）
      if (isInitialMount.current) {
        isInitialMount.current = false;
        return;
      }

      // 2回目以降のフォーカス時のみ再取得
      fetchPlaylist();
    }, [fetchPlaylist])
  );

  // リフレッシュ
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPlaylist();
    setRefreshing(false);
  }, [fetchPlaylist]);

  // 編集モード切り替え
  const handleToggleEditMode = () => {
    if (isEditMode) {
      // 編集モードを解除 - 変更を破棄
      setEditTitle(playlist?.title || '');
      setEditDescription(playlist?.description || '');
      setEditIsPublic(playlist?.isPublic || true);
      setEditCoverImageUrl(playlist?.coverImageUrl);
    }
    setIsEditMode(!isEditMode);
  };

  // 保存
  const handleSave = async () => {
    if (!playlist || !user) return;

    if (!editTitle.trim()) {
      window.alert('エラー: タイトルを入力してください');
      return;
    }

    setIsSaving(true);

    const { data, error } = await updatePlaylist(playlist.id, user.id, {
      title: editTitle.trim(),
      description: editDescription.trim() || undefined,
      isPublic: editIsPublic,
      coverImageUrl: editCoverImageUrl,
    });

    setIsSaving(false);

    if (error) {
      console.error('Failed to update playlist:', error);
      window.alert('エラー: プレイリストの更新に失敗しました');
      return;
    }

    if (data) {
      setPlaylist(data);
      setIsEditMode(false);
      window.alert('プレイリストを更新しました');
    }
  };

  // プレイリスト削除
  const handleDelete = () => {
    if (!playlist || !user) return;

    Alert.alert(
      'プレイリストを削除',
      '本当に削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: async () => {
            const { success, error } = await deletePlaylist(playlist.id, user.id);

            if (error) {
              console.error('Failed to delete playlist:', error);
              window.alert('エラー: プレイリストの削除に失敗しました');
              return;
            }

            if (success) {
              window.alert('プレイリストを削除しました');
              navigation.goBack();
            }
          },
        },
      ]
    );
  };

  // 曲を削除
  const handleRemoveTrack = async (playlistTrackId: string) => {
    if (!playlist || !user) return;

    const { success, error } = await removeTrackFromPlaylist(
      playlist.id,
      playlistTrackId,
      user.id
    );

    if (error) {
      console.error('Failed to remove track:', error);
      window.alert('エラー: 曲の削除に失敗しました');
      return;
    }

    if (success) {
      // プレイリストを再取得
      await fetchPlaylist();
    }
  };

  // 曲を上に移動
  const handleMoveTrackUp = async (index: number) => {
    if (!playlist || !playlist.tracks || !user) return;
    if (index === 0) return; // 既に一番上

    const tracks = [...playlist.tracks];
    const currentTrack = tracks[index];
    const previousTrack = tracks[index - 1];

    // position を入れ替え
    const updates = [
      { id: currentTrack.id, position: index - 1 },
      { id: previousTrack.id, position: index },
    ];

    const { success, error } = await reorderPlaylistTracks(playlist.id, user.id, updates);

    if (error) {
      console.error('Failed to reorder tracks:', error);
      window.alert('エラー: 曲の並び替えに失敗しました');
      return;
    }

    if (success) {
      // プレイリストを再取得
      await fetchPlaylist();
    }
  };

  // 曲を下に移動
  const handleMoveTrackDown = async (index: number) => {
    if (!playlist || !playlist.tracks || !user) return;
    if (index === playlist.tracks.length - 1) return; // 既に一番下

    const tracks = [...playlist.tracks];
    const currentTrack = tracks[index];
    const nextTrack = tracks[index + 1];

    // position を入れ替え
    const updates = [
      { id: currentTrack.id, position: index + 1 },
      { id: nextTrack.id, position: index },
    ];

    const { success, error } = await reorderPlaylistTracks(playlist.id, user.id, updates);

    if (error) {
      console.error('Failed to reorder tracks:', error);
      window.alert('エラー: 曲の並び替えに失敗しました');
      return;
    }

    if (success) {
      // プレイリストを再取得
      await fetchPlaylist();
    }
  };

  // 曲追加画面へ遷移
  const handleAddTrack = () => {
    if (!playlist) return;
    navigation.navigate('AddTrack', { playlistId: playlist.id });
  };

  // 投稿画面へ遷移
  const handleCreatePost = () => {
    if (!playlist) return;
    // CreatePostScreenに遷移してプレイリストIDを渡す
    // @ts-ignore - Navigate to root stack
    navigation.getParent()?.getParent()?.navigate('CreatePost', {
      playlistId: playlist.id,
    });
  };

  if (loading || !playlist) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.headerButton}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プレイリスト</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
      >
        {/* プレイリスト情報 */}
        <View style={styles.infoSection}>
          {/* カバー画像 */}
          {getCoverImageUrl() ? (
            <Image source={{ uri: getCoverImageUrl() }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverImagePlaceholder}>
              <Text style={styles.coverImagePlaceholderIcon}>🎵</Text>
            </View>
          )}

          {/* カバー画像変更ボタン（編集モード時のみ） */}
          {isEditMode && playlist?.tracks && playlist.tracks.length > 0 && (
            <TouchableOpacity
              style={styles.changeCoverButton}
              onPress={() => setShowCoverSelector(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.changeCoverButtonText}>📷 カバー画像を変更</Text>
            </TouchableOpacity>
          )}

          {/* タイトル */}
          {isEditMode ? (
            <TextInput
              style={styles.titleInput}
              placeholder="プレイリストタイトル"
              placeholderTextColor="#808080"
              value={editTitle}
              onChangeText={setEditTitle}
              maxLength={100}
            />
          ) : (
            <Text style={styles.title}>{playlist.title}</Text>
          )}

          {/* 説明 */}
          {isEditMode ? (
            <TextInput
              style={styles.descriptionInput}
              placeholder="説明（任意）"
              placeholderTextColor="#808080"
              value={editDescription}
              onChangeText={setEditDescription}
              multiline={true}
              numberOfLines={3}
              maxLength={500}
            />
          ) : playlist.description ? (
            <Text style={styles.description}>{playlist.description}</Text>
          ) : null}

          {/* 作成者と曲数 */}
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>
              {playlist.user?.displayName || playlist.user?.username || '不明'}
            </Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>{playlist.tracksCount}曲</Text>
            <Text style={styles.metaSeparator}>•</Text>
            <Text style={styles.metaText}>
              {playlist.isPublic ? '公開' : '非公開'}
            </Text>
          </View>

          {/* 公開設定（編集モード時） */}
          {isEditMode && (
            <View style={styles.publicSetting}>
              <Text style={styles.publicLabel}>公開設定</Text>
              <Switch
                value={editIsPublic}
                onValueChange={setEditIsPublic}
                trackColor={{ false: '#3A3A3A', true: Colors.primary }}
                thumbColor={Colors.white}
              />
            </View>
          )}

          {/* アクションボタン */}
          {isOwner && (
            <View style={styles.actions}>
              {isEditMode ? (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSave}
                    disabled={isSaving}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>
                      {isSaving ? '保存中...' : '保存'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.cancelButton]}
                    onPress={handleToggleEditMode}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>キャンセル</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    onPress={handleToggleEditMode}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>編集</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.addTrackButton]}
                    onPress={handleAddTrack}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>+ 曲を追加</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.postButton]}
                    onPress={handleCreatePost}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.actionButtonText}>投稿</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.deleteButtonText}>削除</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        </View>

        {/* 曲リスト */}
        <View style={styles.tracksSection}>
          <Text style={styles.sectionTitle}>曲一覧</Text>
          {playlist.tracks && playlist.tracks.length > 0 ? (
            playlist.tracks.map((playlistTrack, index) => (
              <PlaylistTrackItem
                key={playlistTrack.id}
                playlistTrack={playlistTrack}
                position={index}
                isOwner={isOwner}
                isEditMode={isEditMode}
                onMoveUp={() => handleMoveTrackUp(index)}
                onMoveDown={() => handleMoveTrackDown(index)}
                onDelete={() => handleRemoveTrack(playlistTrack.id)}
                isFirst={index === 0}
                isLast={index === playlist.tracks!.length - 1}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎵</Text>
              <Text style={styles.emptyText}>まだ曲が追加されていません</Text>
              {isOwner && (
                <TouchableOpacity
                  style={styles.emptyButton}
                  onPress={handleAddTrack}
                  activeOpacity={0.7}
                >
                  <Text style={styles.emptyButtonText}>曲を追加</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* カバー画像選択モーダル */}
      <Modal
        visible={showCoverSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowCoverSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>カバー画像を選択</Text>
              <TouchableOpacity
                onPress={() => setShowCoverSelector(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCloseButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={playlist?.tracks || []}
              keyExtractor={(item) => item.id}
              numColumns={3}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.thumbnailItem}
                  onPress={() => {
                    setEditCoverImageUrl(item.track?.thumbnailUrl);
                    setShowCoverSelector(false);
                  }}
                  activeOpacity={0.7}
                >
                  {item.track?.thumbnailUrl ? (
                    <Image
                      source={{ uri: item.track.thumbnailUrl }}
                      style={styles.thumbnailImage}
                    />
                  ) : (
                    <View style={styles.thumbnailPlaceholder}>
                      <Text style={styles.thumbnailPlaceholderIcon}>🎵</Text>
                    </View>
                  )}
                  <Text style={styles.thumbnailText} numberOfLines={1}>
                    {item.track?.title || '不明'}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.thumbnailGrid}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
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
  infoSection: {
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  titleInput: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: Typography.fontSize.md,
    color: '#B0B0B0',
    marginBottom: Spacing.md,
  },
  descriptionInput: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  metaText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  metaSeparator: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginHorizontal: Spacing.xs,
  },
  publicSetting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  publicLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  actionButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  editButton: {
    backgroundColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  cancelButton: {
    backgroundColor: '#3A3A3A',
  },
  addTrackButton: {
    backgroundColor: Colors.primary,
  },
  postButton: {
    backgroundColor: '#3F51B5',
  },
  deleteButton: {
    backgroundColor: '#3A1A1A',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  deleteButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#FF6666',
  },
  tracksSection: {
    paddingTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    color: '#808080',
    marginBottom: Spacing.lg,
  },
  emptyButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  coverImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: Spacing.md,
    backgroundColor: '#2A2A2A',
  },
  coverImagePlaceholder: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: Spacing.md,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverImagePlaceholderIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  changeCoverButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  changeCoverButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  modalCloseButton: {
    fontSize: 24,
    color: '#808080',
    paddingHorizontal: Spacing.sm,
  },
  thumbnailGrid: {
    padding: Spacing.sm,
  },
  thumbnailItem: {
    flex: 1,
    margin: Spacing.xs,
    maxWidth: '31%',
  },
  thumbnailImage: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
  },
  thumbnailPlaceholder: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailPlaceholderIcon: {
    fontSize: 32,
    opacity: 0.3,
  },
  thumbnailText: {
    fontSize: Typography.fontSize.xs,
    color: '#B0B0B0',
    marginTop: Spacing.xs,
    textAlign: 'center',
  },
});
