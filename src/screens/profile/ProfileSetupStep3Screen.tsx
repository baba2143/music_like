import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ProgressBar } from '../../components/profile/ProgressBar';
import { FormInput } from '../../components/profile/FormInput';
import { FormSelect } from '../../components/profile/FormSelect';
import { CheckboxGroup } from '../../components/profile/CheckboxGroup';
import { PostFrequency } from '../../types/profile';
import { Colors, Typography, Spacing } from '../../config/theme';

export const ProfileSetupStep3Screen: React.FC = () => {
  const [postFrequency, setPostFrequency] = useState<PostFrequency>();
  const [introduction, setIntroduction] = useState('');
  const [profileSettings, setProfileSettings] = useState<string[]>([
    'isProfilePublic',
    'showAge',
    'showLocation',
  ]);
  const [notificationSettings, setNotificationSettings] = useState<string[]>([
    'notifyLikes',
    'notifyComments',
    'notifyFollows',
    'notifyMessages',
  ]);

  const handleBack = () => {
    Alert.alert('準備中', 'Step 2への遷移は準備中です');
  };

  const handleComplete = () => {
    Alert.alert('準備中', 'プロフィール完成処理は準備中です');
  };

  const profileSettingsOptions = [
    { label: 'プロフィールを公開する', value: 'isProfilePublic' },
    { label: '年齢を表示する', value: 'showAge' },
    { label: '地域を表示する', value: 'showLocation' },
  ];

  const notificationSettingsOptions = [
    { label: 'いいね通知', value: 'notifyLikes' },
    { label: 'コメント通知', value: 'notifyComments' },
    { label: 'フォロー通知', value: 'notifyFollows' },
    { label: 'メッセージ通知', value: 'notifyMessages' },
  ];

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
        <Text style={styles.title}>あと少しで完成！</Text>
        <Text style={styles.subtitle}>最後に詳細設定をしましょう</Text>

        {/* フォーム */}
        <View style={styles.form}>
          {/* 投稿頻度 */}
          <FormSelect<PostFrequency>
            label="投稿頻度（任意）"
            value={postFrequency}
            placeholder="選択してください"
            onPress={() => Alert.alert('準備中', '投稿頻度選択は準備中です')}
          />

          {/* 自己紹介 */}
          <FormInput
            label="自己紹介（任意）"
            placeholder="あなたの自己紹介を入力してください"
            value={introduction}
            onChangeText={setIntroduction}
            multiline
            numberOfLines={4}
            maxLength={500}
            style={styles.textArea}
          />

          {/* プロフィール設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>プロフィール設定</Text>
            <CheckboxGroup
              label=""
              options={profileSettingsOptions}
              values={profileSettings}
              onChange={setProfileSettings}
            />
          </View>

          {/* 通知設定 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>通知設定</Text>
            <CheckboxGroup
              label=""
              options={notificationSettingsOptions}
              values={notificationSettings}
              onChange={setNotificationSettings}
            />
          </View>
        </View>
      </ScrollView>

      {/* ボタン */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backButtonText}>戻る</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.completeButton} onPress={handleComplete} activeOpacity={0.8}>
          <Text style={styles.completeButtonText}>完了</Text>
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
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: Spacing.md,
  },
  section: {
    marginTop: Spacing.xl,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.md,
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
  completeButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
