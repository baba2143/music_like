import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { User } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface UserSearchCardProps {
  user: User;
  onPress?: (userId: string) => void;
}

export const UserSearchCard: React.FC<UserSearchCardProps> = ({ user, onPress }) => {
  const handlePress = () => {
    if (onPress) {
      onPress(user.id);
    } else {
      Alert.alert('準備中', 'ユーザープロフィール表示機能は準備中です');
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      {/* アバター */}
      <View style={styles.avatar}>
        {user.avatarUrl ? (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
      </View>

      {/* ユーザー情報 */}
      <View style={styles.userInfo}>
        <Text style={styles.username}>{user.username}</Text>
        {user.displayName && <Text style={styles.displayName}>{user.displayName}</Text>}
      </View>

      {/* フォローボタン（準備中） */}
      <TouchableOpacity
        style={styles.followButton}
        onPress={(e) => {
          e.stopPropagation();
          Alert.alert('準備中', 'フォロー機能は準備中です');
        }}
        activeOpacity={0.7}
      >
        <Text style={styles.followButtonText}>フォロー</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    backgroundColor: '#000000',
  },
  avatar: {
    marginRight: Spacing.md,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  displayName: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  followButton: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  followButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
