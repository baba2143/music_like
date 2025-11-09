import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface CheckboxGroupProps {
  label: string;
  options: readonly string[];
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
}

export const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  options,
  selectedValues,
  onValuesChange,
}) => {
  const handleToggle = (value: string) => {
    const isSelected = selectedValues.includes(value);
    if (isSelected) {
      onValuesChange(selectedValues.filter((v) => v !== value));
    } else {
      onValuesChange([...selectedValues, value]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.helperText}>複数選択可能です</Text>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => {
          const isSelected = selectedValues.includes(option);
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.checkboxItem,
                isSelected && styles.checkboxItemSelected,
              ]}
              onPress={() => handleToggle(option)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  isSelected && styles.checkboxSelected,
                ]}
              >
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {selectedValues.length > 0 && (
        <Text style={styles.selectedCount}>
          {selectedValues.length}個選択中
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  helperText: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginBottom: Spacing.sm,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  checkboxItemSelected: {
    backgroundColor: 'rgba(255, 20, 147, 0.1)',
    borderColor: Colors.primary,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#4A4A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.xs,
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  checkmark: {
    fontSize: Typography.fontSize.xs,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  optionText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.white,
  },
  selectedCount: {
    fontSize: Typography.fontSize.xs,
    color: Colors.primary,
    marginTop: Spacing.sm,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
