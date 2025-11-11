import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { createPlaylist } from '../../services/playlistService';

export const CreatePlaylistScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!user) {
      setError('ログインが必要です');
      return;
    }

    if (!title.trim()) {
      setError('タイトルを入力してください');
      return;
    }

    setLoading(true);
    setError(null);

    const { data: playlist, error: createError } = await createPlaylist(
      user.id,
      title.trim(),
      description.trim() || undefined,
      isPublic
    );

    setLoading(false);

    if (createError) {
      setError('プレイリストの作成に失敗しました');
      console.error('Failed to create playlist:', createError);
      return;
    }

    if (playlist) {
      // プレイリスト作成成功 - 前の画面に戻る
      navigation.goBack();
      // TODO: 作成したプレイリストの詳細画面に遷移する場合は以下のようにする
      // navigation.navigate('PlaylistDetail', { playlistId: playlist.id });
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} activeOpacity={0.7}>
            <Text style={styles.cancelButton}>キャンセル</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>プレイリスト作成</Text>
          <TouchableOpacity
            onPress={handleCreate}
            disabled={loading || !title.trim()}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.createButton,
                (!title.trim() || loading) && styles.createButtonDisabled,
              ]}
            >
              作成
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* タイトル */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              タイトル <Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="プレイリストのタイトル"
              placeholderTextColor="#808080"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              autoFocus={true}
            />
            <Text style={styles.charCount}>{title.length}/100</Text>
          </View>

          {/* 説明 */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>説明</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="プレイリストの説明（任意）"
              placeholderTextColor="#808080"
              value={description}
              onChangeText={setDescription}
              multiline={true}
              numberOfLines={4}
              maxLength={500}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{description.length}/500</Text>
          </View>

          {/* 公開設定 */}
          <View style={styles.settingContainer}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>公開設定</Text>
              <Text style={styles.settingDescription}>
                {isPublic
                  ? '誰でも見ることができます'
                  : '自分だけが見ることができます'}
              </Text>
            </View>
            <Switch
              value={isPublic}
              onValueChange={setIsPublic}
              trackColor={{ false: '#3A3A3A', true: Colors.primary }}
              thumbColor={Colors.white}
            />
          </View>

          {/* エラー表示 */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* ローディング */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors.primary} />
              <Text style={styles.loadingText}>作成中...</Text>
            </View>
          )}

          {/* ヘルプテキスト */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              プレイリストを作成した後、曲を追加できます。
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.black,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
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
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  cancelButton: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    fontWeight: Typography.fontWeight.medium,
  },
  createButton: {
    fontSize: Typography.fontSize.md,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
  createButtonDisabled: {
    color: '#808080',
  },
  form: {
    padding: Spacing.md,
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.primary,
  },
  input: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: Spacing.md,
    fontSize: Typography.fontSize.md,
    color: Colors.white,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.md,
  },
  charCount: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    textAlign: 'right',
    marginTop: Spacing.xs,
  },
  settingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  errorContainer: {
    backgroundColor: '#3A1A1A',
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: Typography.fontSize.sm,
    color: '#FF6666',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: Spacing.lg,
  },
  loadingText: {
    fontSize: Typography.fontSize.md,
    color: '#808080',
    marginTop: Spacing.sm,
  },
  helpContainer: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    textAlign: 'center',
  },
});
