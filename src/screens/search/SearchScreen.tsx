import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

export const SearchScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>探す</Text>
      <Text style={styles.subtitle}>準備中</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.gray50,
  },
  title: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.gray900,
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: Typography.fontSize.md,
    color: Colors.gray600,
  },
});
