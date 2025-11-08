import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { FormInput } from '../../components/profile/FormInput';
import { Colors, Typography, Spacing } from '../../config/theme';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useProfileSetup } from '../../contexts/ProfileSetupContext';

type ProfileSetupStep2NavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'ProfileSetupStep2'
>;

export const ProfileSetupStep2Screen: React.FC = () => {
  const navigation = useNavigation<ProfileSetupStep2NavigationProp>();
  const { profileData, updateProfileData } = useProfileSetup();

  const [oshiGroup, setOshiGroup] = useState(profileData.oshiGroup);
  const [oshiMember, setOshiMember] = useState(profileData.oshiMember);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleNext = () => {
    // データを保存して次のステップへ
    updateProfileData({
      oshiGroup: oshiGroup.trim(),
      oshiMember: oshiMember.trim(),
    });

    navigation.navigate('ProfileSetupStep3');
  };

  const handleSkip = () => {
    // Step3へスキップ
    updateProfileData({
      oshiGroup: oshiGroup.trim(),
      oshiMember: oshiMember.trim(),
    });
    navigation.navigate('ProfileSetupStep3');
  };

  return (
    <View style={styles.container}>
      {/* プログレスバー */}
      <ProgressBar currentStep={2} totalSteps={3} />

      {/* スクロール可能なコンテンツ */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* タイトル */}
        <Text style={styles.title}>推しを教えて</Text>
        <Text style={styles.subtitle}>あなたの好きなグループやメンバーを教えてください（任意）</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* 推しグループ */}
          <FormInput
            label="推しグループ・アーティスト"
            placeholder="例: 乃木坂46"
            value={oshiGroup}
            onChangeText={setOshiGroup}
            maxLength={50}
          />

          {/* 推しメンバー */}
          <FormInput
            label="推しメンバー"
            placeholder="例: 山下美月"
            value={oshiMember}
            onChangeText={setOshiMember}
            maxLength={50}
          />
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>

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
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
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
    flex: 1,
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
