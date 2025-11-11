import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { FormInput } from '../../components/profile/FormInput';
import { Colors, Typography, Spacing } from '../../config/theme';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useProfileSetup } from '../../contexts/ProfileSetupContext';
import { checkUsernameAvailability } from '../../services/userService';

type ProfileSetupStep1NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileSetupStep1'
>;

export const ProfileSetupStep1Screen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupStep1NavigationProp>();
  const { profileData, updateProfileData } = useProfileSetup();

  const [username, setUsername] = useState(profileData.username);
  const [displayName, setDisplayName] = useState(profileData.displayName);
  const [bio, setBio] = useState(profileData.bio);

  const [usernameError, setUsernameError] = useState('');
  const [displayNameError, setDisplayNameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);

  // ユーザー名の重複チェック（デバウンス付き）
  useEffect(() => {
    if (!username || username.length < 3) {
      return;
    }

    // ユーザー名の形式チェック
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(username)) {
      setUsernameError('ユーザー名は3-20文字の英数字とアンダースコアのみ使用できます');
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsCheckingUsername(true);
      setUsernameError('');

      const { isAvailable, error } = await checkUsernameAvailability(username);

      if (error) {
        setUsernameError('ユーザー名の確認に失敗しました');
      } else if (!isAvailable) {
        setUsernameError('このユーザー名は既に使用されています');
      }

      setIsCheckingUsername(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleNext = () => {
    // バリデーション
    if (!username.trim()) {
      setUsernameError('ユーザー名を入力してください');
      return;
    }

    if (!displayName.trim()) {
      setDisplayNameError('表示名を入力してください');
      return;
    }

    if (displayName.trim().length < 2) {
      setDisplayNameError('表示名は2文字以上で入力してください');
      return;
    }

    if (usernameError || isCheckingUsername) {
      return;
    }

    // データを保存して次のステップへ
    updateProfileData({
      username: username.trim(),
      displayName: displayName.trim(),
      bio: bio.trim(),
    });

    navigation.navigate('ProfileSetupStep2');
  };

  const handleSkip = () => {
    // Step2へスキップ（最低限のデータは入力必須）
    if (username.trim() && displayName.trim() && !usernameError && !isCheckingUsername) {
      updateProfileData({
        username: username.trim(),
        displayName: displayName.trim(),
        bio: bio.trim(),
      });
      navigation.navigate('ProfileSetupStep2');
    }
  };

  return (
    <View style={styles.container}>
      {/* プログレスバー */}
      <ProgressBar currentStep={1} totalSteps={3} />

      {/* スクロール可能なコンテンツ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* タイトル */}
        <Text style={styles.title}>基本情報を入力</Text>
        <Text style={styles.subtitle}>あなたのプロフィールを作成しましょう</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* ユーザー名 */}
          <View style={styles.formGroup}>
            <FormInput
              label="ユーザー名"
              required={true}
              placeholder="例: music_lover"
              value={username}
              onChangeText={(text) => {
                setUsername(text.toLowerCase());
                setUsernameError('');
              }}
              error={usernameError}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {isCheckingUsername && (
              <View style={styles.checkingContainer}>
                <ActivityIndicator size="small" color={Colors.primary} />
                <Text style={styles.checkingText}>確認中...</Text>
              </View>
            )}
            {!isCheckingUsername && username.length >= 3 && !usernameError && (
              <Text style={styles.successText}>✓ 利用可能です</Text>
            )}
            <Text style={styles.helpText}>@{username || 'username'} として表示されます</Text>
          </View>

          {/* 表示名 */}
          <FormInput
            label="表示名"
            required={true}
            placeholder="例: 音楽太郎"
            value={displayName}
            onChangeText={(text) => {
              setDisplayName(text);
              setDisplayNameError('');
            }}
            error={displayNameError}
            maxLength={50}
          />

          {/* 自己紹介 */}
          <FormInput
            label="自己紹介"
            placeholder="例: 音楽が大好きです！よろしくお願いします"
            value={bio}
            onChangeText={setBio}
            maxLength={200}
            multiline={true}
            numberOfLines={4}
          />
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip} activeOpacity={0.7}>
          <Text style={styles.skipButtonText}>スキップ</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext} activeOpacity={0.8}>
          <Text style={styles.nextButtonText}>次へ</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xl,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginTop: Spacing.xl,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    marginBottom: Spacing.xl,
  },
  form: {
    marginTop: Spacing.base,
  },
  formGroup: {
    marginBottom: Spacing.lg,
  },
  checkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  checkingText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginLeft: Spacing.xs,
  },
  successText: {
    fontSize: Typography.fontSize.sm,
    color: '#4CAF50',
    marginTop: Spacing.xs,
  },
  helpText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginTop: Spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  skipButton: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#808080',
  },
  nextButton: {
    flex: 2,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
