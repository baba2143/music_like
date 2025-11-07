import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

interface FormInputProps extends TextInputProps {
  label: string;
  required?: boolean;
  error?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  error,
  ...inputProps
}) => {
  return (
    <View style={styles.container}>
      {/* ラベル */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* 入力フィールド */}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#808080"
        {...inputProps}
      />

      {/* エラーメッセージ */}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

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
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: BorderRadius.base,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
  inputError: {
    borderColor: '#FF4444',
  },
  errorText: {
    fontSize: Typography.fontSize.xs,
    color: '#FF4444',
    marginTop: Spacing.xs,
  },
});
