import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { AuthProvider } from '../../types/auth';
import { Colors, Typography, Spacing, BorderRadius } from '../../config/theme';

interface LoginButtonProps {
  provider: AuthProvider;
  onPress: () => void;
}

const providerConfig = {
  apple: {
    label: 'Appleでログイン',
    icon: '',
    textColor: Colors.white,
  },
  line: {
    label: 'LINEでログイン',
    icon: '',
    textColor: Colors.white,
  },
  google: {
    label: 'Googleでログイン',
    icon: 'G',
    textColor: Colors.white,
  },
};

export const LoginButton: React.FC<LoginButtonProps> = ({ provider, onPress }) => {
  const config = providerConfig[provider];

  return (
    <TouchableOpacity style={styles.button} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{config.icon}</Text>
      </View>
      <Text style={[styles.label, { color: config.textColor }]}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A', // 濃いグレー
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.base,
    marginBottom: Spacing.md,
    flex: 1,
  },
  iconContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: Typography.fontSize.md,
    color: Colors.white,
  },
  label: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
