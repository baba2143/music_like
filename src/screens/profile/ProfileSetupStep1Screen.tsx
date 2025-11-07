import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { FormInput } from '../../components/profile/FormInput';
import { FormSelect } from '../../components/profile/FormSelect';
import { RadioGroup } from '../../components/profile/RadioGroup';
import { AgeGroup, Gender, Prefecture } from '../../types/profile';
import { Colors, Typography, Spacing } from '../../config/theme';

export const ProfileSetupStep1Screen: React.FC = () => {
  const [nickname, setNickname] = useState('');
  const [age, setAge] = useState<AgeGroup>();
  const [gender, setGender] = useState<Gender>();
  const [prefecture, setPrefecture] = useState<Prefecture>();
  const [nicknameError, setNicknameError] = useState('');

  const handleNext = () => {
    // バリデーション
    if (!nickname.trim()) {
      setNicknameError('ニックネームを入力してください');
      return;
    }

    if (nickname.trim().length < 2) {
      setNicknameError('ニックネームは2文字以上で入力してください');
      return;
    }

    // 次のステップへ
    Alert.alert('準備中', 'Step 2への遷移は準備中です');
  };

  const handleSkip = () => {
    Alert.alert('準備中', 'スキップ機能は準備中です');
  };

  const genderOptions = [
    { label: '男性', value: '男性' as Gender },
    { label: '女性', value: '女性' as Gender },
    { label: 'その他', value: 'その他' as Gender },
    { label: '回答しない', value: '回答しない' as Gender },
  ];

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
          {/* ニックネーム */}
          <FormInput
            label="ニックネーム"
            required
            placeholder="例: 音楽太郎"
            value={nickname}
            onChangeText={(text) => {
              setNickname(text);
              setNicknameError('');
            }}
            error={nicknameError}
            maxLength={20}
          />

          {/* 年齢 */}
          <FormSelect<AgeGroup>
            label="年齢"
            value={age}
            placeholder="選択してください"
            onPress={() => Alert.alert('準備中', '年齢選択は準備中です')}
          />

          {/* 性別 */}
          <RadioGroup<Gender>
            label="性別"
            options={genderOptions}
            value={gender}
            onChange={setGender}
          />

          {/* 地域 */}
          <FormSelect<Prefecture>
            label="地域"
            value={prefecture}
            placeholder="選択してください"
            onPress={() => Alert.alert('準備中', '地域選択は準備中です')}
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
