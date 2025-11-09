import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

// 数値をフォーマット（1000 → 1k, 1200 → 1.2k）
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace('.0', '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return num.toString();
};

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  postsCount,
  followersCount,
  followingCount,
  onPostsPress,
  onFollowersPress,
  onFollowingPress,
}) => {
  const handlePostsPress = () => {
    if (onPostsPress) {
      onPostsPress();
    }
  };

  const handleFollowersPress = () => {
    if (onFollowersPress) {
      onFollowersPress();
    } else {
      window.alert('準備中: フォロワー一覧機能は準備中です');
    }
  };

  const handleFollowingPress = () => {
    if (onFollowingPress) {
      onFollowingPress();
    } else {
      window.alert('準備中: フォロー一覧機能は準備中です');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.statItem}
        onPress={handlePostsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatNumber(postsCount)}</Text>
        <Text style={styles.statLabel}>投稿</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowersPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatNumber(followersCount)}</Text>
        <Text style={styles.statLabel}>フォロワー</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowingPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{formatNumber(followingCount)}</Text>
        <Text style={styles.statLabel}>フォロー中</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#000000',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
});
