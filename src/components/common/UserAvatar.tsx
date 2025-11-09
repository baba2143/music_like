import React from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../config/theme';

interface UserAvatarProps {
  avatarUrl?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const sizeMap = {
  small: 32,
  medium: 40,
  large: 56,
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, size = 'medium', style }) => {
  const avatarSize = sizeMap[size];

  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
        style,
      ]}
    >
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          resizeMode="cover"
          style={[
            styles.image,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            { width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  image: {},
  placeholder: {
    backgroundColor: Colors.gray300,
  },
});
