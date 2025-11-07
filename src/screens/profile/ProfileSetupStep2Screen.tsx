import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { TagInput } from '../../components/profile/TagInput';
import { FormSelect } from '../../components/profile/FormSelect';
import { RadioGroup } from '../../components/profile/RadioGroup';
import { FanDuration, ActivityStyle } from '../../types/profile';
import { Colors, Typography, Spacing } from '../../config/theme';

export const ProfileSetupStep2Screen: React.FC = () => {
  const [favoriteGroups, setFavoriteGroups] = useState<string[]>([]);
  const [favoriteMembers, setFavoriteMembers] = useState<string[]>([]);
  const [fanDuration, setFanDuration] = useState<FanDuration>();
  const [activityStyle, setActivityStyle] = useState<ActivityStyle>();

  const handleBack = () => {
    Alert.alert('準備中', 'Step 1への遷移は準備中です');
  };

  const handleNext = () => {
    // バリデーション
    if (favoriteGroups.length === 0) {
      Alert.alert('確認', '好きなグループ・アーティストを最低1つ入力してください');
      return;
    }

    // 次のステップへ
    Alert.alert('準備中', 'Step 3への遷移は準備中です');
  };

  const activityStyleOptions = [
    { label: 'ライブ重視', value: 'ライブ重視' as ActivityStyle },
    { label: 'CD・グッズ重視', value: 'CD・グッズ重視' as ActivityStyle },
    { label: 'SNS・配信重視', value: 'SNS・配信重視' as ActivityStyle },
    { label: 'バランス型', value: 'バランス型' as ActivityStyle },
  ];

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
        <Text style={styles.title}>音楽の趣味を教えて</Text>
        <Text style={styles.subtitle}>あなたの好きな音楽について教えてください</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* 好きなグループ・アーティスト */}
          <TagInput
            label="好きなグループ・アーティスト"
            required
            placeholder="例: 〇〇"
            values={favoriteGroups}
            onChange={setFavoriteGroups}
            maxTags={10}
          />

          {/* 推しメンバー */}
          <TagInput
            label="推しメンバー"
            placeholder="例: △△"
            values={favoriteMembers}
            onChange={setFavoriteMembers}
            maxTags={10}
          />

          {/* ファン歴 */}
          <FormSelect<FanDuration>
            label="ファン歴"
            value={fanDuration}
            placeholder="選択してください"
            onPress={() => Alert.alert('準備中', 'ファン歴選択は準備中です')}
          />

          {/* 活動スタイル */}
          <RadioGroup<ActivityStyle>
            label="活動スタイル"
            options={activityStyleOptions}
            value={activityStyle}
            onChange={setActivityStyle}
          />
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>戻る</Text>
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
