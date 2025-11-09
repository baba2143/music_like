import React, { useState } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';
import { toggleFollow } from '../../services/followService';

interface FollowButtonProps {
  userId: string; // フォロー対象のユーザーID
  currentUserId: string; // 現在のユーザーID
  initialIsFollowing: boolean; // 初期フォロー状態
  onFollowChange?: (isFollowing: boolean) => void; // フォロー状態変更時のコールバック
  size?: 'small' | 'medium' | 'large';
  style?: any;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
  userId,
  currentUserId,
  initialIsFollowing,
  onFollowChange,
  size = 'medium',
  style,
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [loading, setLoading] = useState(false);

  const handlePress = async () => {
    if (!currentUserId) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      setLoading(true);
      const { isFollowing: newIsFollowing, error } = await toggleFollow(
        currentUserId,
        userId
      );

      if (error) {
        console.error('フォロー切り替えエラー:', error);
        window.alert('エラー: フォローの切り替えに失敗しました');
        return;
      }

      setIsFollowing(newIsFollowing);
      onFollowChange?.(newIsFollowing);
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      window.alert('エラー: 予期しないエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.buttonSmall;
      case 'large':
        return styles.buttonLarge;
      default:
        return styles.buttonMedium;
    }
  };

  const getTextSizeStyles = () => {
    switch (size) {
      case 'small':
        return styles.textSmall;
      case 'large':
        return styles.textLarge;
      default:
        return styles.textMedium;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getSizeStyles(),
        isFollowing ? styles.followingButton : styles.followButton,
        style,
      ]}
      onPress={handlePress}
      disabled={loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={Colors.white} />
      ) : (
        <Text style={[styles.text, getTextSizeStyles()]}>
          {isFollowing ? 'フォロー中' : 'フォローする'}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  buttonSmall: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    minHeight: 32,
  },
  buttonMedium: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    minHeight: 40,
  },
  buttonLarge: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    minHeight: 48,
  },
  followButton: {
    backgroundColor: Colors.primary,
  },
  followingButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  text: {
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  textSmall: {
    fontSize: Typography.fontSize.xs,
  },
  textMedium: {
    fontSize: Typography.fontSize.sm,
  },
  textLarge: {
    fontSize: Typography.fontSize.base,
  },
});
