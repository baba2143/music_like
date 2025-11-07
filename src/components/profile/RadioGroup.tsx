import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface RadioOption<T> {
  label: string;
  value: T;
}

interface RadioGroupProps<T> {
  label: string;
  required?: boolean;
  options: RadioOption<T>[];
  value?: T;
  onChange: (value: T) => void;
}

export function RadioGroup<T>({
  label,
  required = false,
  options,
  value,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      {/* ラベル */}
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>

      {/* オプション */}
      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = value === option.value;

          return (
            <TouchableOpacity
              key={index}
              style={styles.option}
              onPress={() => onChange(option.value)}
              activeOpacity={0.7}
            >
              {/* ラジオボタン */}
              <View style={styles.radio}>
                {isSelected && <View style={styles.radioSelected} />}
              </View>

              {/* ラベル */}
              <Text style={styles.optionLabel}>{option.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
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
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.primary,
  },
  optionsContainer: {
    gap: Spacing.sm,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#808080',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  radioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.primary,
  },
  optionLabel: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
  },
});
