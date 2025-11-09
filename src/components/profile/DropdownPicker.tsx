import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface DropdownPickerProps {
  label: string;
  placeholder?: string;
  value: string | undefined;
  options: readonly string[] | readonly { label: string; value: string }[];
  onValueChange: (value: string) => void;
}

export const DropdownPicker: React.FC<DropdownPickerProps> = ({
  label,
  placeholder = '選択してください',
  value,
  options,
  onValueChange,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  // 選択肢が文字列配列かオブジェクト配列かを判定
  const isStringArray = typeof options[0] === 'string';

  // 表示用のラベルを取得
  const getDisplayLabel = (): string => {
    if (!value) return placeholder;

    if (isStringArray) {
      return value;
    }

    const option = (options as { label: string; value: string }[]).find(
      (opt) => opt.value === value
    );
    return option ? option.label : placeholder;
  };

  // 選択肢をクリックしたときの処理
  const handleSelect = (selectedValue: string) => {
    onValueChange(selectedValue);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>

      {/* ドロップダウンボタン */}
      <TouchableOpacity
        style={styles.picker}
        onPress={() => setModalVisible(true)}
        activeOpacity={0.7}
      >
        <Text style={[styles.pickerText, !value && styles.placeholderText]}>
          {getDisplayLabel()}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      {/* モーダル */}
      <Modal
        animationType="slide"
        transparent
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.optionsList}>
              {options.map((option, index) => {
                const optionValue = isStringArray
                  ? (option as string)
                  : (option as { label: string; value: string }).value;
                const optionLabel = isStringArray
                  ? (option as string)
                  : (option as { label: string; value: string }).label;

                const isSelected = value === optionValue;

                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionItem, isSelected && styles.optionItemSelected]}
                    onPress={() => handleSelect(optionValue)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {optionLabel}
                    </Text>
                    {isSelected && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  picker: {
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
  pickerText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    flex: 1,
  },
  placeholderText: {
    color: '#666666',
  },
  arrow: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: Spacing.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  closeButton: {
    fontSize: Typography.fontSize.xl,
    color: '#808080',
    paddingHorizontal: Spacing.sm,
  },
  optionsList: {
    paddingHorizontal: Spacing.lg,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  optionItemSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
  },
  optionText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  optionTextSelected: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  checkmark: {
    fontSize: Typography.fontSize.lg,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.bold,
  },
});
