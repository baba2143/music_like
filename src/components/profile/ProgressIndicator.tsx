import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface ProgressIndicatorProps {
  currentStep: number; // 1, 2, or 3
  totalSteps: number; // 3
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentStep,
  totalSteps,
}) => {
  const steps = [
    { number: 1, label: '基本情報' },
    { number: 2, label: '詳細情報' },
    { number: 3, label: '興味関心' },
  ];

  return (
    <View style={styles.container}>
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          {/* ステップアイテム */}
          <View style={styles.stepItem}>
            <View
              style={[
                styles.stepCircle,
                step.number === currentStep && styles.stepCircleActive,
                step.number < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {step.number < currentStep ? (
                <Text style={styles.checkmark}>✓</Text>
              ) : (
                <Text
                  style={[
                    styles.stepNumber,
                    step.number === currentStep && styles.stepNumberActive,
                  ]}
                >
                  {step.number}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepLabel,
                step.number === currentStep && styles.stepLabelActive,
              ]}
            >
              {step.label}
            </Text>
          </View>

          {/* 接続線（最後のステップ以外） */}
          {index < steps.length - 1 && (
            <View
              style={[
                styles.connector,
                step.number < currentStep && styles.connectorCompleted,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    borderWidth: 2,
    borderColor: '#4A4A4A',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  stepCircleActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepCircleCompleted: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  stepNumber: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.bold,
    color: '#808080',
  },
  stepNumberActive: {
    color: Colors.white,
  },
  checkmark: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.bold,
  },
  stepLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
    marginTop: Spacing.xs,
  },
  stepLabelActive: {
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
  connector: {
    height: 2,
    flex: 0.5,
    backgroundColor: '#2A2A2A',
    marginBottom: 24, // ラベル分のスペース
  },
  connectorCompleted: {
    backgroundColor: Colors.primary,
  },
});
