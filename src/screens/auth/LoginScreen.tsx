import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { LoginButton } from '../../components/auth/LoginButton';
import { AuthProvider } from '../../types/auth';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors, Typography, Spacing } from '../../config/theme';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();

  const handleLogin = (provider: AuthProvider) => {
    // TODO: 実際の認証処理を実装する
    // テスト用：直接MainTabsに遷移
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      {/* 音符アイコン */}
      <View style={styles.iconContainer}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>🎵</Text>
        </View>
      </View>

      {/* キャッチコピー */}
      <Text style={styles.catchphrase}>音楽好きと繋がろう</Text>

      {/* ログインボタン */}
      <View style={styles.buttonsContainer}>
        <LoginButton provider="apple" onPress={() => handleLogin('apple')} />
        <LoginButton provider="line" onPress={() => handleLogin('line')} />
        <LoginButton provider="google" onPress={() => handleLogin('google')} />
      </View>

      {/* 利用規約・プライバシーポリシー */}
      <Text style={styles.terms}>
        続行することで、<Text style={styles.termsLink}>利用規約・プライバシーポリシー</Text>
        に同意したとみなされます
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // 真っ黒背景
    paddingHorizontal: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: Spacing.xxxl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary, // ピンク
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
    marginBottom: Spacing.xxxl,
    textAlign: 'center',
  },
  buttonsContainer: {
    width: '100%',
    marginBottom: Spacing.xxxl,
  },
  terms: {
    fontSize: Typography.fontSize.xs,
    color: '#808080', // グレー
    textAlign: 'center',
    paddingHorizontal: Spacing.base,
  },
  termsLink: {
    color: Colors.primary, // ピンク
  },
});
