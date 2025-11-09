import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Image } from 'react-native';
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
      window.alert('準備中: プロフィール編集機能は準備中です');
    }
  };

  const handleSharePress = async () => {
    try {
      await Share.share({
        message: `@${user.username}さんのプロフィールをチェック！`,
      });
    } catch (error) {
      console.error('Failed to share profile:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* アバター */}
      <View style={styles.avatarContainer}>
        {user.avatarUrl ? (
          <Image source={{ uri: user.avatarUrl }} style={styles.avatarImage} />
        ) : (
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        {/* 編集アイコン */}
        <TouchableOpacity
          style={styles.editIconButton}
          onPress={handleEditPress}
          activeOpacity={0.7}
        >
          <Text style={styles.editIcon}>✏️</Text>
        </TouchableOpacity>
      </View>

      {/* ユーザー情報 */}
      <View style={styles.infoContainer}>
        <Text style={styles.username}>@{user.username}</Text>
        {user.bio && <Text style={styles.bio}>{user.bio}</Text>}
      </View>

      {/* アクションボタン */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleEditPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>プロフィールを編集</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleSharePress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionButtonText}>プロフィールをシェア</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: '#000000',
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E5E5E5', // 白っぽい背景
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#000000',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: Typography.fontWeight.bold,
    color: '#808080',
  },
  editIconButton: {
    position: 'absolute',
    bottom: 0,
    right: '35%',
    backgroundColor: Colors.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000000',
  },
  editIcon: {
    fontSize: 14,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  username: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  bio: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: Spacing.md,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#000000',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
