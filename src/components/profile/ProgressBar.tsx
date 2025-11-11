import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface ProgressBarProps {
  currentStep: 1 | 2 | 3;
  totalSteps: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, totalSteps }) => {
  const progress = (currentStep / totalSteps) * 100;

  return (
    <View style={styles.container}>
      {/* ステップ表示 */}
      <Text style={styles.stepText}>
        {currentStep}/{totalSteps}
      </Text>

      {/* プログレスバー */}
      <View style={styles.progressBarContainer}>
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { flex: progress / 100 }]} />
          <View style={{ flex: (100 - progress) / 100 }} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  stepText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.white,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarBackground: {
    flexDirection: 'row',
    height: 4,
    backgroundColor: '#2A2A2A',
    borderRadius: 2,
  },
  progressBarFill: {
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
});
