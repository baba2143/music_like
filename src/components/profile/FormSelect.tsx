import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

interface FormSelectProps<T> {
  label: string;
  required?: boolean;
  value?: T;
  placeholder?: string;
  onPress: () => void;
  displayValue?: string;
}

export function FormSelect<T>({
  label,
  required = false,
  value,
  placeholder,
  onPress,
  displayValue,
}: FormSelectProps<T>) {
  return (
    <View style={styles.container}>
      {/* ラベル */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* セレクトボタン */}
      <TouchableOpacity style={styles.selectButton} onPress={onPress} activeOpacity={0.7}>
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {displayValue || value?.toString() || placeholder || '選択してください'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.primary,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  selectText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    flex: 1,
  },
  placeholder: {
    color: '#808080',
  },
  arrow: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginLeft: Spacing.sm,
  },
});
