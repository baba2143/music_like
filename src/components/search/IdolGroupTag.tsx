import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface IdolGroupTagProps {
  name: string;
  onPress: (name: string) => void;
}

export const IdolGroupTag: React.FC<IdolGroupTagProps> = ({ name, onPress }) => {
  return (
    <TouchableOpacity
      style={styles.tag}
      onPress={() => onPress(name)}
      activeOpacity={0.7}
    >
      <Text style={styles.tagText}>{name}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  tag: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: 20,
    marginRight: Spacing.sm,
  },
  tagText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
