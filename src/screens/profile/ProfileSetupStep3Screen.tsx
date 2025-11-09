import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { TagInput } from '../../components/profile/TagInput';
import { ArtistSelector } from '../../components/profile/ArtistSelector';
import { Colors, Typography, Spacing } from '../../config/theme';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useProfileSetup } from '../../contexts/ProfileSetupContext';
import { useAuth } from '../../contexts/AuthContext';
import { createUserProfile } from '../../services/userService';
import { saveFavoriteArtists } from '../../services/artistService';
import { Artist } from '../../types/models';

type ProfileSetupStep3NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileSetupStep3'
>;

export const ProfileSetupStep3Screen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupStep3NavigationProp>();
  const { profileData, updateProfileData, resetProfileData } = useProfileSetup();
  const { user } = useAuth();

  const [favoriteGenres, setFavoriteGenres] = useState(profileData.favoriteGenres);
  const [favoriteArtists, setFavoriteArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleComplete = async () => {
    if (!user) {
      Alert.alert('エラー', 'ユーザー情報が取得できませんでした');
      return;
    }

    setIsLoading(true);

    // 1. Supabaseにプロフィールを作成
    const { data, error } = await createUserProfile({
      id: user.id,
      username: profileData.username,
      displayName: profileData.displayName,
      bio: profileData.bio || undefined,
      oshiGroup: profileData.oshiGroup || undefined,
      oshiMember: profileData.oshiMember || undefined,
    });

    if (error) {
      setIsLoading(false);
      Alert.alert('エラー', 'プロフィールの作成に失敗しました。もう一度お試しください。');
      return;
    }

    // 2. お気に入りアーティストをデータベースに保存
    if (favoriteArtists.length > 0) {
      const artistIds = favoriteArtists.map((artist) => artist.id);
      const { error: artistError } = await saveFavoriteArtists(user.id, artistIds);

      if (artistError) {
        setIsLoading(false);
        Alert.alert('エラー', 'お気に入りアーティストの保存に失敗しました。');
        return;
      }
    }

    setIsLoading(false);

    // データを保存（ジャンルはContextに保存、アーティストはDB保存済み）
    updateProfileData({
      favoriteGenres,
      favoriteArtists: [], // アーティストはDBに保存したので空にする
    });

    // 成功したらProfileSetupデータをリセット
    resetProfileData();

    // メイン画面へ遷移
    navigation.navigate('MainTabs');
  };

  return (
    <View style={styles.container}>
      {/* プログレスバー */}
      <ProgressBar currentStep={3} totalSteps={3} />

      {/* スクロール可能なコンテンツ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* タイトル */}
        <Text style={styles.title}>音楽の好みを教えて</Text>
        <Text style={styles.subtitle}>好きなジャンルやアーティストを登録しましょう（任意）</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* お気に入りジャンル */}
          <TagInput
            label="お気に入りジャンル"
            values={favoriteGenres}
            onChange={setFavoriteGenres}
            placeholder="例: J-POP"
            maxTags={10}
          />

          {/* お気に入りアーティスト（データベース管理） */}
          {user && (
            <ArtistSelector
              label="お気に入りアーティスト"
              selectedArtists={favoriteArtists}
              onArtistsChange={setFavoriteArtists}
              placeholder="アーティスト名を検索"
              maxArtists={10}
              userId={user.id}
            />
          )}
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.completeButton, isLoading && styles.completeButtonDisabled]}
          onPress={handleComplete}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} />
          ) : (
            <Text style={styles.completeButtonText}>完了</Text>
          )}
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
  footer: {
    flexDirection: 'row',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  backButton: {
    flex: 1,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: '#808080',
  },
  completeButton: {
    flex: 2,
    paddingVertical: Spacing.base,
    borderRadius: 8,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeButtonDisabled: {
    opacity: 0.5,
  },
  completeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
