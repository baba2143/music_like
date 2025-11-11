import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Typography, Spacing } from '../../config/theme';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { getPost, updatePost } from '../../services/postService';
import { Post } from '../../types/models';

type EditPostRouteProp = RouteProp<RootStackParamList, 'EditPost'>;
type EditPostNavigationProp = NativeStackNavigationProp<RootStackParamList, 'EditPost'>;

export const EditPostScreen: React.FC = () => {
  const navigation = useNavigation<EditPostNavigationProp>();
  const route = useRoute<EditPostRouteProp>();
  const { user } = useAuth();
  const { postId } = route.params;

  const [post, setPost] = useState<Post | null>(null);
  const [caption, setCaption] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 投稿データを取得
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data, error } = await getPost(postId, user?.id);

        if (error) {
          console.error('投稿取得エラー:', error);
          window.alert('エラー: 投稿の取得に失敗しました');
          navigation.goBack();
          return;
        }

        if (data) {
          // 自分の投稿かチェック
          if (data.userId !== user?.id) {
            window.alert('エラー: 編集権限がありません');
            navigation.goBack();
            return;
          }

          setPost(data);
          setCaption(data.caption || '');
          setHashtags(data.hashtags ? data.hashtags.map(tag => `#${tag}`).join(' ') : '');
        }
      } catch (error) {
        console.error('Failed to fetch post:', error);
        window.alert('エラー: 予期しないエラーが発生しました');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId, user, navigation]);

  // ハッシュタグをパース
  const parseHashtags = (text: string): string[] => {
    if (!text.trim()) return [];
    return text
      .split(/[\s,]+/)
      .filter(tag => tag.startsWith('#'))
      .map(tag => tag.slice(1)); // #を削除
  };

  // 保存処理
  const handleSave = async () => {
    if (!user || !post) {
      window.alert('エラー: ログインが必要です');
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await updatePost(post.id, {
        caption: caption.trim() || undefined,
        hashtags: parseHashtags(hashtags),
      });

      if (error) {
        console.error('投稿更新エラー:', error);
        window.alert('エラー: 投稿の更新に失敗しました');
        return;
      }

      if (data) {
        window.alert('投稿を更新しました');
        navigation.goBack();
      }
    } catch (error) {
      console.error('Failed to update post:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>投稿が見つかりませんでした</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>投稿を編集</Text>
        <View style={{ width: 70 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* 投稿タイプ表示（編集不可） */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>投稿タイプ</Text>
          <View style={styles.typeDisplay}>
            <Text style={styles.typeDisplayText}>
              {post.contentType === 'playlist'
                ? 'プレイリスト'
                : post.contentType === 'track'
                ? '今聴いてる曲'
                : 'テキスト'}
            </Text>
          </View>
          <Text style={styles.helpText}>※ 投稿タイプは変更できません</Text>
        </View>

        {/* プレイリスト情報表示（編集不可） */}
        {post.contentType === 'playlist' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>プレイリスト情報</Text>
            <View style={styles.infoDisplay}>
              <Text style={styles.infoLabel}>タイトル</Text>
              <Text style={styles.infoText}>{post.playlistTitle}</Text>
            </View>
            <View style={styles.infoDisplay}>
              <Text style={styles.infoLabel}>サービス</Text>
              <Text style={styles.infoText}>
                {post.playlistService === 'spotify'
                  ? 'Spotify'
                  : post.playlistService === 'apple_music'
                  ? 'Apple Music'
                  : 'YouTube Music'}
              </Text>
            </View>
            <Text style={styles.helpText}>※ プレイリスト情報は変更できません</Text>
          </View>
        )}

        {/* トラック情報表示（編集不可） */}
        {post.contentType === 'track' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>楽曲情報</Text>
            <View style={styles.infoDisplay}>
              <Text style={styles.infoLabel}>曲名</Text>
              <Text style={styles.infoText}>{post.trackTitle}</Text>
            </View>
            <View style={styles.infoDisplay}>
              <Text style={styles.infoLabel}>アーティスト</Text>
              <Text style={styles.infoText}>{post.trackArtist}</Text>
            </View>
            <Text style={styles.helpText}>※ 楽曲情報は変更できません</Text>
          </View>
        )}

        {/* キャプション（編集可能） */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>
            {post.contentType === 'text' ? 'テキスト' : 'キャプション'}
          </Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={post.contentType === 'text' ? '何を考えていますか？' : 'この投稿について...'}
            placeholderTextColor="#808080"
            value={caption}
            onChangeText={setCaption}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ハッシュタグ（編集可能） */}
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

      {/* 保存ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.8}
        >
          {saving ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.saveButtonText}>保存する</Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  errorText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
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
  typeDisplay: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
  },
  typeDisplayText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
  },
  infoDisplay: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  infoLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginBottom: 2,
  },
  infoText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
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
  footer: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
