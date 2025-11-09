import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../../config/theme';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../services/postService';
import { PostType } from '../../types/models';
import {
  fetchSpotifyOEmbed,
  detectMusicService,
  fetchMusicMetadata,
} from '../../services/musicMetadataService';

type CreatePostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreatePost'>;

export const CreatePostScreen: React.FC = () => {
  const navigation = useNavigation<CreatePostNavigationProp>();
  const { user } = useAuth();

  const [postType, setPostType] = useState<PostType>('playlist');
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');

  // プレイリスト関連の状態
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistTitle, setPlaylistTitle] = useState('');
  const [playlistService, setPlaylistService] = useState<'spotify' | 'apple_music' | 'youtube_music'>('spotify');

  // トラック関連の状態
  const [trackTitle, setTrackTitle] = useState('');
  const [trackArtist, setTrackArtist] = useState('');
  const [trackAlbum, setTrackAlbum] = useState('');
  const [trackUrl, setTrackUrl] = useState('');

  const [isPosting, setIsPosting] = useState(false);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);

  // ハッシュタグをパース
  const parseHashtags = (text: string): string[] => {
    if (!text.trim()) return [];
    return text
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.slice(1)); // #を削除
  };

  // プレイリストURLからメタデータを取得
  const handleFetchPlaylistMetadata = async () => {
    if (!playlistUrl.trim()) {
      window.alert('エラー: プレイリストURLを入力してください');
      return;
    }

    // サービスを自動検出
    const service = detectMusicService(playlistUrl);
    if (!service) {
      window.alert('エラー: Spotify、Apple Music、YouTube Musicのリンクのみ対応しています');
      return;
    }

    setIsFetchingMetadata(true);
    console.log('メタデータ取得開始:', playlistUrl);

    try {
      let metadata = null;

      // Spotifyの場合はoEmbed APIを優先
      if (service === 'spotify') {
        const { data, error } = await fetchSpotifyOEmbed(playlistUrl);
        if (data) {
          metadata = data;
        } else {
          console.log('Spotify oEmbed失敗、通常のメタデータ取得を試行:', error);
          const fallbackResult = await fetchMusicMetadata(playlistUrl);
          metadata = fallbackResult.data;
        }
      } else {
        // Apple Music, YouTube Musicの場合
        const { data } = await fetchMusicMetadata(playlistUrl);
        metadata = data;
      }

      if (metadata) {
        console.log('取得したメタデータ:', metadata);

        // フォームに自動入力
        if (metadata.title && !playlistTitle) {
          setPlaylistTitle(metadata.title);
        }
        if (metadata.service) {
          setPlaylistService(metadata.service);
        }

        window.alert('プレビュー取得完了！\nタイトルが自動入力されました。');
      } else {
        window.alert('メタデータの取得に失敗しました\n手動で入力してください');
      }
    } catch (error) {
      console.error('メタデータ取得エラー:', error);
      window.alert('エラー: メタデータの取得に失敗しました\n手動で入力してください');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // トラックURLからメタデータを取得
  const handleFetchTrackMetadata = async () => {
    if (!trackUrl.trim()) {
      window.alert('エラー: 楽曲URLを入力してください');
      return;
    }

    const service = detectMusicService(trackUrl);
    if (!service) {
      window.alert('エラー: Spotify、Apple Music、YouTube Musicのリンクのみ対応しています');
      return;
    }

    setIsFetchingMetadata(true);
    console.log('メタデータ取得開始:', trackUrl);

    try {
      let metadata = null;

      if (service === 'spotify') {
        const { data } = await fetchSpotifyOEmbed(trackUrl);
        metadata = data;
      } else {
        const { data } = await fetchMusicMetadata(trackUrl);
        metadata = data;
      }

      if (metadata) {
        console.log('取得したメタデータ:', metadata);

        // フォームに自動入力
        if (metadata.title && !trackTitle) {
          // Spotifyの場合: "Artist - Track Name" 形式
          const parts = metadata.title.split(' - ');
          if (parts.length >= 2) {
            setTrackArtist(parts[0].trim());
            setTrackTitle(parts.slice(1).join(' - ').trim());
          } else {
            setTrackTitle(metadata.title);
          }
        }
        if (metadata.artist && !trackArtist) {
          setTrackArtist(metadata.artist);
        }

        window.alert('プレビュー取得完了！\n曲情報が自動入力されました。');
      } else {
        window.alert('メタデータの取得に失敗しました\n手動で入力してください');
      }
    } catch (error) {
      console.error('メタデータ取得エラー:', error);
      window.alert('エラー: メタデータの取得に失敗しました\n手動で入力してください');
    } finally {
      setIsFetchingMetadata(false);
    }
  };

  // バリデーション
  const validatePost = (): string | null => {
    if (!user) return 'ログインが必要です';

    if (postType === 'playlist') {
      if (!playlistUrl.trim()) return 'プレイリストURLを入力してください';
      if (!playlistTitle.trim()) return 'プレイリスト名を入力してください';
    } else if (postType === 'track') {
      if (!trackTitle.trim()) return '曲名を入力してください';
      if (!trackArtist.trim()) return 'アーティスト名を入力してください';
    } else if (postType === 'text') {
      if (!caption.trim()) return 'テキストを入力してください';
    }

    return null;
  };

  // 投稿作成
  const handleCreatePost = async () => {
    console.log('=== 投稿作成開始 ===');
    console.log('ユーザー情報:', user);

    const validationError = validatePost();
    if (validationError) {
      console.log('バリデーションエラー:', validationError);
      window.alert(`入力エラー: ${validationError}`);
      return;
    }

    if (!user) {
      console.log('エラー: ユーザー情報がありません');
      window.alert('エラー: ログインが必要です');
      return;
    }

    setIsPosting(true);

    try {
      const postData = {
        userId: user.id,
        contentType: postType,
        caption: caption.trim() || undefined,
        hashtags: parseHashtags(hashtags),
        // プレイリスト
        playlistUrl: postType === 'playlist' ? playlistUrl.trim() : undefined,
        playlistTitle: postType === 'playlist' ? playlistTitle.trim() : undefined,
        playlistService: postType === 'playlist' ? playlistService : undefined,
        // トラック
        trackTitle: postType === 'track' ? trackTitle.trim() : undefined,
        trackArtist: postType === 'track' ? trackArtist.trim() : undefined,
        trackAlbum: postType === 'track' ? trackAlbum.trim() || undefined : undefined,
        trackUrl: postType === 'track' ? trackUrl.trim() || undefined : undefined,
      };

      console.log('投稿データ:', postData);

      const { data, error } = await createPost(postData);

      console.log('createPost結果 - data:', data);
      console.log('createPost結果 - error:', error);

      if (error) {
        console.error('投稿エラー:', error);
        window.alert('投稿エラー: 投稿の作成に失敗しました');
        return;
      }

      if (data) {
        console.log('投稿成功！');
        window.alert('投稿完了: 投稿が作成されました');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to create post:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setIsPosting(false);
      console.log('=== 投稿作成終了 ===');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={styles.cancelButton}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新規投稿</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 投稿タイプ選択 */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>投稿タイプ</Text>
          <View style={styles.typeSelector}>
            <TouchableOpacity
              style={[styles.typeButton, postType === 'playlist' && styles.typeButtonActive]}
              onPress={() => setPostType('playlist')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, postType === 'playlist' && styles.typeButtonTextActive]}>
                プレイリスト
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, postType === 'track' && styles.typeButtonActive]}
              onPress={() => setPostType('track')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, postType === 'track' && styles.typeButtonTextActive]}>
                今聴いてる曲
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.typeButton, postType === 'text' && styles.typeButtonActive]}
              onPress={() => setPostType('text')}
              activeOpacity={0.7}
            >
              <Text style={[styles.typeButtonText, postType === 'text' && styles.typeButtonTextActive]}>
                テキスト
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* プレイリスト投稿 */}
        {postType === 'playlist' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>プレイリスト情報</Text>

            <Text style={styles.inputLabel}>サービス</Text>
            <View style={styles.serviceSelector}>
              {(['spotify', 'apple_music', 'youtube_music'] as const).map((service) => (
                <TouchableOpacity
                  key={service}
                  style={[styles.serviceButton, playlistService === service && styles.serviceButtonActive]}
                  onPress={() => setPlaylistService(service)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.serviceButtonText, playlistService === service && styles.serviceButtonTextActive]}>
                    {service === 'spotify' ? 'Spotify' : service === 'apple_music' ? 'Apple Music' : 'YouTube Music'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>プレイリスト名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="例: お気に入りの曲たち"
              placeholderTextColor="#808080"
              value={playlistTitle}
              onChangeText={setPlaylistTitle}
            />

            <Text style={styles.inputLabel}>プレイリストURL *</Text>
            <TextInput
              style={styles.input}
              placeholder="例: https://open.spotify.com/playlist/..."
              placeholderTextColor="#808080"
              value={playlistUrl}
              onChangeText={setPlaylistUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* プレビュー取得ボタン */}
            <TouchableOpacity
              style={[styles.previewButton, isFetchingMetadata && styles.previewButtonDisabled]}
              onPress={handleFetchPlaylistMetadata}
              disabled={isFetchingMetadata || !playlistUrl.trim()}
              activeOpacity={0.7}
            >
              {isFetchingMetadata ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.previewButtonText}>📥 URLからプレビューを取得</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* トラック投稿 */}
        {postType === 'track' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>楽曲情報</Text>

            <Text style={styles.inputLabel}>曲名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="例: Pretender"
              placeholderTextColor="#808080"
              value={trackTitle}
              onChangeText={setTrackTitle}
            />

            <Text style={styles.inputLabel}>アーティスト名 *</Text>
            <TextInput
              style={styles.input}
              placeholder="例: Official髭男dism"
              placeholderTextColor="#808080"
              value={trackArtist}
              onChangeText={setTrackArtist}
            />

            <Text style={styles.inputLabel}>アルバム名</Text>
            <TextInput
              style={styles.input}
              placeholder="例: Traveler"
              placeholderTextColor="#808080"
              value={trackAlbum}
              onChangeText={setTrackAlbum}
            />

            <Text style={styles.inputLabel}>楽曲URL</Text>
            <TextInput
              style={styles.input}
              placeholder="例: https://open.spotify.com/track/..."
              placeholderTextColor="#808080"
              value={trackUrl}
              onChangeText={setTrackUrl}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* プレビュー取得ボタン */}
            <TouchableOpacity
              style={[styles.previewButton, isFetchingMetadata && styles.previewButtonDisabled]}
              onPress={handleFetchTrackMetadata}
              disabled={isFetchingMetadata || !trackUrl.trim()}
              activeOpacity={0.7}
            >
              {isFetchingMetadata ? (
                <ActivityIndicator size="small" color={Colors.white} />
              ) : (
                <Text style={styles.previewButtonText}>📥 URLからプレビューを取得</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* キャプション（全タイプ共通） */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {postType === 'text' ? 'テキスト *' : 'キャプション'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={postType === 'text' ? '何を考えていますか？' : 'この投稿について...'}
            placeholderTextColor="#808080"
            value={caption}
            onChangeText={setCaption}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ハッシュタグ（全タイプ共通） */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ハッシュタグ</Text>
          <TextInput
            style={styles.input}
            placeholder="#音楽好き #おすすめ"
            placeholderTextColor="#808080"
            value={hashtags}
            onChangeText={setHashtags}
            autoCapitalize="none"
          />
          <Text style={styles.helpText}>#で始まるタグをスペースまたはカンマで区切って入力</Text>
        </View>
      </ScrollView>

      {/* 投稿ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.postButton, isPosting && styles.postButtonDisabled]}
          onPress={handleCreatePost}
          disabled={isPosting}
          activeOpacity={0.8}
        >
          {isPosting ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.postButtonText}>投稿する</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  cancelButton: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionLabel: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  typeSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  typeButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  typeButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  typeButtonText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  typeButtonTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
  serviceSelector: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.base,
  },
  serviceButton: {
    flex: 1,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.xs,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
  },
  serviceButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  serviceButtonText: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  serviceButtonTextActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
  },
  inputLabel: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginBottom: Spacing.xs,
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  helpText: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginTop: Spacing.xs,
  },
  previewButton: {
    backgroundColor: '#2A2A2A',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    minHeight: 44,
  },
  previewButtonDisabled: {
    opacity: 0.5,
  },
  previewButtonText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
  },
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  postButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  postButtonDisabled: {
    opacity: 0.6,
  },
  postButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
