import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LoginButton } from '../../components/auth/LoginButton';
import { AuthProvider } from '../../types/auth';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors, Typography, Spacing } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getJapaneseErrorMessage } from '../../services/authService';
import { getUserProfile } from '../../services/userService';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, signUp } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // メール認証でのログイン/サインアップ
  const handleEmailAuth = async () => {
    // バリデーション
    if (!email || !password) {
      Alert.alert('エラー', 'メールアドレスとパスワードを入力してください');
      return;
    }

    if (isSignUp && password !== confirmPassword) {
      Alert.alert('エラー', 'パスワードが一致しません');
      return;
    }

    setIsLoading(true);

    try {
      if (isSignUp) {
        // サインアップ
        const { data, error } = await signUp(email, password);

        if (error) {
          Alert.alert('サインアップエラー', getJapaneseErrorMessage(error));
          return;
        }

        if (data) {
          // メール確認が無効の場合は直接ProfileSetupへ遷移
          navigation.navigate('ProfileSetupStep1');
        }
      } else {
        // ログイン
        const { data, error } = await signIn(email, password);

        if (error) {
          Alert.alert('ログインエラー', getJapaneseErrorMessage(error));
          return;
        }

        if (data) {
          // プロフィールの存在確認
          const { data: profile } = await getUserProfile(data.id);

          if (profile) {
            // プロフィールが存在する → メイン画面へ
            navigation.navigate('MainTabs');
          } else {
            // プロフィールが存在しない → プロフィール設定へ
            navigation.navigate('ProfileSetupStep1');
          }
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  // SNSログイン（一旦テスト用）
  const handleSocialLogin = (provider: AuthProvider) => {
    // TODO: SNS認証を実装
    Alert.alert('準備中', `${provider}でのログインは準備中です`);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* 音符アイコン */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🎵</Text>
          </View>
        </View>

        {/* キャッチコピー */}
        <Text style={styles.catchphrase}>音楽好きと繋がろう</Text>

        {/* メール認証フォーム */}
        <View style={styles.formContainer}>
          <TextInput
            style={styles.input}
            placeholder="メールアドレス"
            placeholderTextColor="#808080"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={styles.input}
            placeholder="パスワード（6文字以上）"
            placeholderTextColor="#808080"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={true}
            autoCapitalize="none"
            autoCorrect={false}
          />

          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="パスワード（確認）"
              placeholderTextColor="#808080"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={true}
              autoCapitalize="none"
              autoCorrect={false}
            />
          )}

          <TouchableOpacity
            style={[styles.authButton, isLoading && styles.authButtonDisabled]}
            onPress={handleEmailAuth}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.authButtonText}>
                {isSignUp ? '新規登録' : 'ログイン'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchModeButton}
            onPress={() => {
              setIsSignUp(!isSignUp);
              setPassword('');
              setConfirmPassword('');
            }}
            activeOpacity={0.7}
          >
            <Text style={styles.switchModeText}>
              {isSignUp ? 'すでにアカウントをお持ちですか？ログイン' : 'アカウントを作成'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 区切り線 */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>または</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* SNSログインボタン */}
        <View style={styles.buttonsContainer}>
          <LoginButton provider="apple" onPress={() => handleSocialLogin('apple')} />
          <LoginButton provider="line" onPress={() => handleSocialLogin('line')} />
          <LoginButton provider="google" onPress={() => handleSocialLogin('google')} />
        </View>

        {/* 利用規約・プライバシーポリシー */}
        <Text style={styles.terms}>
          続行することで、<Text style={styles.termsLink}>利用規約・プライバシーポリシー</Text>
          に同意したとみなされます
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  iconContainer: {
    marginBottom: Spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 50,
  },
  catchphrase: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  input: {
    flex: 1,
    height: 50,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    paddingHorizontal: Spacing.base,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  authButton: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  authButtonDisabled: {
    opacity: 0.6,
  },
  authButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  switchModeButton: {
    marginTop: Spacing.base,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginVertical: Spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#2A2A2A',
  },
  dividerText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    marginHorizontal: Spacing.base,
  },
  buttonsContainer: {
    flex: 1,
    marginBottom: Spacing.lg,
  },
  terms: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
  },
  termsLink: {
    color: Colors.primary,
  },
});
