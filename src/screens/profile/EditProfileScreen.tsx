import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { useAuth } from '../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../services/userService';
import { uploadAvatar } from '../../services/storageService';
import { Colors, Spacing, Typography } from '../../config/theme';
import { ProgressIndicator } from '../../components/profile/ProgressIndicator';
import { DropdownPicker } from '../../components/profile/DropdownPicker';
import { CheckboxGroup } from '../../components/profile/CheckboxGroup';
import { RadioButtonGroup } from '../../components/profile/RadioButtonGroup';
import {
  GENDERS,
  FAN_YEARS,
  SUPPORT_AMOUNTS,
  OTAKU_STYLES,
  SUPPORTER_WELCOME,
  EVENT_FREQUENCY,
} from '../../constants/profileOptions';

type EditProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation<EditProfileScreenNavigationProp>();
  const { user } = useAuth();

  // ステップ管理
  const [currentStep, setCurrentStep] = useState(1);

  // Step 1: 基本情報
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [oshiGroup, setOshiGroup] = useState('');
  const [oshiMember, setOshiMember] = useState('');

  // Step 2: 詳細情報
  const [gender, setGender] = useState<string | undefined>(undefined);
  const [birthDate, setBirthDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [location, setLocation] = useState('');
  const [fanYears, setFanYears] = useState<string | undefined>(undefined);
  const [supportAmount, setSupportAmount] = useState<string | undefined>(undefined);

  // Step 3: 興味関心
  const [otakuStyles, setOtakuStyles] = useState<string[]>([]);
  const [supporterWelcome, setSupporterWelcome] = useState<string | undefined>(undefined);
  const [eventFrequency, setEventFrequency] = useState<string | undefined>(undefined);

  // UI状態
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // プロフィールデータの取得
  useEffect(() => {
    const loadProfile = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await getUserProfile(user.id);

        if (error) {
          console.error('プロフィール取得エラー:', error);
          window.alert('エラー: プロフィールの取得に失敗しました');
          navigation.goBack();
          return;
        }

        if (data) {
          // Step 1: 基本情報
          setDisplayName(data.displayName || '');
          setBio(data.bio || '');
          setAvatarUrl(data.avatarUrl || '');
          setOshiGroup(data.oshiGroup || '');
          setOshiMember(data.oshiMember || '');

          // Step 2: 詳細情報
          setGender(data.gender as 'male' | 'female' | 'other' | 'private' | undefined);
          if (data.birthDate) {
            setBirthDate(new Date(data.birthDate as unknown as string));
          }
          setLocation(data.location || '');
          setFanYears(data.fanYears as string | undefined);
          setSupportAmount(data.supportAmount as string | undefined);

          // Step 3: 興味関心
          setOtakuStyles(data.otakuStyles || []);
          setSupporterWelcome(data.supporterWelcome as 'yes' | 'no' | undefined);
          setEventFrequency(data.eventFrequency as 'frequent' | 'sometimes' | 'rarely' | undefined);
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
        window.alert('エラー: 予期しないエラーが発生しました');
        navigation.goBack();
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [user, navigation]);

  // 画像選択ハンドラー
  const handleSelectImage = async () => {
    try {
      // 権限をリクエスト
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (status !== 'granted') {
        window.alert('権限が必要です\n\nカメラロールへのアクセス権限が必要です');
        return;
      }

      // 画像を選択
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1], // 正方形
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;
        console.log('選択した画像:', imageUri);
        setSelectedImage(imageUri);
      }
    } catch (error) {
      console.error('❌ 画像選択エラー:', error);
      window.alert('エラー: 画像の選択に失敗しました');
    }
  };

  // ステップナビゲーション
  const handleNext = () => {
    // Step 1のバリデーション
    if (currentStep === 1) {
      if (!displayName.trim()) {
        window.alert('エラー: ニックネームを入力してください');
        return;
      }
    }

    // 次のステップへ
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // DatePicker変更ハンドラー
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setBirthDate(selectedDate);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    // 最終バリデーション
    if (!displayName.trim()) {
      window.alert('エラー: ニックネームを入力してください');
      return;
    }

    setSaving(true);
    try {
      let uploadedAvatarUrl = avatarUrl;

      // 新しい画像が選択されている場合はアップロード
      if (selectedImage) {
        setUploading(true);
        console.log('画像アップロード開始...');

        const { data: uploadData, error: uploadError } = await uploadAvatar(
          user.id,
          selectedImage
        );

        setUploading(false);

        if (uploadError) {
          console.error('❌ 画像アップロードエラー:', uploadError);
          window.alert(`エラー: 画像のアップロードに失敗しました\n\n${uploadError.message}`);
          return;
        }

        if (uploadData) {
          uploadedAvatarUrl = uploadData;
          console.log('アップロード成功:', uploadedAvatarUrl);
        }
      }

      // プロフィールを更新（全ての新しいフィールドを含む）
      const { data, error} = await updateUserProfile(user.id, {
        displayName: displayName.trim(),
        bio: bio.trim() || undefined,
        avatarUrl: uploadedAvatarUrl || undefined,
        oshiGroup: oshiGroup.trim() || undefined,
        oshiMember: oshiMember.trim() || undefined,
        gender: gender as 'male' | 'female' | 'other' | 'private' | undefined,
        birthDate: birthDate,
        location: location.trim() || undefined,
        fanYears,
        supportAmount,
        otakuStyles: otakuStyles.length > 0 ? otakuStyles : undefined,
        supporterWelcome: supporterWelcome as 'yes' | 'no' | undefined,
        eventFrequency: eventFrequency as 'frequent' | 'sometimes' | 'rarely' | undefined,
      });

      if (error) {
        console.error('❌ プロフィール更新エラー:', error);
        window.alert('エラー: プロフィールの更新に失敗しました');
        return;
      }

      if (data) {
        console.log('✅ プロフィール更新成功:', data);
        window.alert('プロフィールを更新しました');
        navigation.goBack();
      }
    } catch (error) {
      console.error('❌ 予期しないエラー:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setSaving(false);
      setUploading(false);
    }
  };

  const handleCancel = () => {
    navigation.goBack();
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Step 1: 基本情報
  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      {/* プロフィール画像 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>プロフィール画像</Text>
        <View style={styles.avatarPreviewContainer}>
          {selectedImage || avatarUrl ? (
            <Image
              source={{ uri: selectedImage || avatarUrl }}
              style={styles.avatarPreview}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>
                {displayName ? displayName.charAt(0).toUpperCase() : '?'}
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={styles.imageSelectButton}
          onPress={handleSelectImage}
          activeOpacity={0.7}
          disabled={uploading}
        >
          <Text style={styles.imageSelectButtonText}>
            {uploading ? 'アップロード中...' : '画像を選択'}
          </Text>
        </TouchableOpacity>
        <Text style={styles.helperText}>推奨: 正方形の画像（最大2MB）</Text>
      </View>

      {/* ニックネーム */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>ニックネーム *</Text>
        <TextInput
          style={styles.input}
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="ニックネームを入力"
          placeholderTextColor="#666666"
          maxLength={50}
        />
        <Text style={styles.helperText}>{displayName.length}/50</Text>
      </View>

      {/* 自己紹介 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>自己紹介</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={bio}
          onChangeText={setBio}
          placeholder="自己紹介を入力"
          placeholderTextColor="#666666"
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
          maxLength={500}
        />
        <Text style={styles.helperText}>{bio.length}/500</Text>
      </View>

      {/* 推しグループ */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>推しグループ</Text>
        <TextInput
          style={styles.input}
          value={oshiGroup}
          onChangeText={setOshiGroup}
          placeholder="グループ名を入力"
          placeholderTextColor="#666666"
          maxLength={100}
        />
      </View>

      {/* 推しメンバー */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>推しメンバー</Text>
        <TextInput
          style={styles.input}
          value={oshiMember}
          onChangeText={setOshiMember}
          placeholder="メンバー名を入力"
          placeholderTextColor="#666666"
          maxLength={100}
        />
      </View>
    </View>
  );

  // Step 2: 詳細情報
  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      {/* 性別 */}
      <DropdownPicker
        label="性別"
        placeholder="性別を選択"
        value={gender}
        options={GENDERS}
        onValueChange={setGender}
      />

      {/* 生年月日 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>生年月日</Text>
        {Platform.OS === 'web' ? (
          <input
            type="date"
            value={birthDate ? birthDate.toISOString().split('T')[0] : ''}
            onChange={(e) => {
              const selectedDate = e.target.value ? new Date(e.target.value) : undefined;
              setBirthDate(selectedDate);
            }}
            max={new Date().toISOString().split('T')[0]}
            style={{
              backgroundColor: '#1A1A1A',
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: '#FFFFFF',
              borderWidth: 1,
              borderColor: '#2A2A2A',
              borderStyle: 'solid',
              flex: 1,
              fontFamily: 'inherit',
            }}
          />
        ) : (
          <>
            <TouchableOpacity
              style={styles.datePickerButton}
              onPress={() => setShowDatePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[styles.datePickerText, !birthDate && styles.placeholderText]}>
                {birthDate ? birthDate.toLocaleDateString('ja-JP') : '生年月日を選択'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={birthDate || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
      </View>

      {/* 居住地 */}
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>居住地</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="都道府県・市区町村を入力"
          placeholderTextColor="#666666"
          maxLength={100}
        />
      </View>

      {/* ファン歴 */}
      <DropdownPicker
        label="ファン歴"
        placeholder="ファン歴を選択"
        value={fanYears}
        options={FAN_YEARS}
        onValueChange={setFanYears}
      />

      {/* 月間支援金額 */}
      <DropdownPicker
        label="月間支援金額"
        placeholder="支援金額を選択"
        value={supportAmount}
        options={SUPPORT_AMOUNTS}
        onValueChange={setSupportAmount}
      />
    </View>
  );

  // Step 3: 興味関心
  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      {/* オタ活スタイル */}
      <CheckboxGroup
        label="オタ活スタイル"
        options={OTAKU_STYLES}
        selectedValues={otakuStyles}
        onValuesChange={setOtakuStyles}
      />

      {/* 同担歓迎設定 */}
      <RadioButtonGroup
        label="同担歓迎設定"
        options={SUPPORTER_WELCOME}
        selectedValue={supporterWelcome}
        onValueChange={setSupporterWelcome}
      />

      {/* 現場参加頻度 */}
      <RadioButtonGroup
        label="現場参加頻度"
        options={EVENT_FREQUENCY}
        selectedValue={eventFrequency}
        onValueChange={setEventFrequency}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>プロフィール編集</Text>
        <View style={styles.headerButton} />
      </View>

      {/* プログレスインジケーター */}
      <ProgressIndicator currentStep={currentStep} totalSteps={3} />

      {/* ステップコンテンツ */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </View>
      </ScrollView>

      {/* フッターボタン */}
      <View style={styles.footer}>
        {currentStep > 1 && (
          <TouchableOpacity
            style={[styles.footerButton, styles.backButton]}
            onPress={handleBack}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>戻る</Text>
          </TouchableOpacity>
        )}

        {currentStep < 3 ? (
          <TouchableOpacity
            style={[styles.footerButton, styles.nextButton, currentStep === 1 && styles.fullWidthButton]}
            onPress={handleNext}
            activeOpacity={0.7}
          >
            <Text style={styles.nextButtonText}>次へ</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.footerButton, styles.saveButtonFooter]}
            onPress={handleSave}
            activeOpacity={0.7}
            disabled={saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? '保存中...' : '保存'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#000000',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minWidth: 70,
  },
  headerButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  saveButton: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
    textAlign: 'right',
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  formContainer: {
    padding: Spacing.lg,
  },
  fieldContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  placeholderText: {
    color: '#666666',
  },
  textArea: {
    minHeight: 100,
    paddingTop: Spacing.sm,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginTop: Spacing.xs,
  },
  noteContainer: {
    marginTop: Spacing.xl,
    padding: Spacing.md,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  noteText: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    lineHeight: 20,
  },
  avatarPreviewContainer: {
    alignItems: 'center',
    marginVertical: Spacing.md,
  },
  avatarPreview: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2A2A2A',
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2A2A2A',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: '#808080',
  },
  imageSelectButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  imageSelectButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  stepContainer: {
    paddingBottom: Spacing.xl,
  },
  datePickerButton: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  datePickerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  switchLabelContainer: {
    flex: 1,
    marginRight: Spacing.md,
  },
  switchHelperText: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginTop: Spacing.xs,
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  footerButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  backButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  nextButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonFooter: {
    backgroundColor: Colors.primary,
  },
  fullWidthButton: {
    flex: 1,
  },
  backButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  nextButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  saveButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
