import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { User } from '../../types/models';
import { Colors, Typography, Spacing } from '../../config/theme';

interface ProfileHeaderProps {
  user: User;
  onEditPress?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, onEditPress }) => {
  const handleEditPress = () => {
    if (onEditPress) {
      onEditPress();
    } else {
      Alert.alert('準備中', 'プロフィール編集機能は準備中です');
    }
  };

  return (
    <View style={styles.container}>
      {/* アバター */}
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
        </View>
      </View>

      {/* ユーザー情報 */}
      <View style={styles.infoContainer}>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.username}>@{user.username}</Text>

        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}

        {(user.oshiGroup || user.oshiMember) && (
          <View style={styles.oshiContainer}>
            {user.oshiGroup && (
              <View style={styles.oshiTag}>
                <Text style={styles.oshiText}>推し: {user.oshiGroup}</Text>
              </View>
            )}
            {user.oshiMember && (
              <View style={styles.oshiTag}>
                <Text style={styles.oshiText}>{user.oshiMember}</Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* 編集ボタン */}
      <TouchableOpacity
        style={styles.editButton}
        onPress={handleEditPress}
        activeOpacity={0.7}
      >
        <Text style={styles.editButtonText}>プロフィール編集</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    backgroundColor: '#000000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  displayName: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  username: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    marginBottom: Spacing.md,
  },
  bio: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  oshiContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  oshiTag: {
    backgroundColor: '#2A2A2A',
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
  },
  oshiText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.medium,
  },
  editButton: {
    backgroundColor: '#1A1A1A',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
