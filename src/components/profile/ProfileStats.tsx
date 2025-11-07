import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Typography, Spacing } from '../../config/theme';

interface ProfileStatsProps {
  postsCount: number;
  followersCount: number;
  followingCount: number;
  onPostsPress?: () => void;
  onFollowersPress?: () => void;
  onFollowingPress?: () => void;
}

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
      Alert.alert('準備中', 'フォロワー一覧機能は準備中です');
    }
  };

  const handleFollowingPress = () => {
    if (onFollowingPress) {
      onFollowingPress();
    } else {
      Alert.alert('準備中', 'フォロー一覧機能は準備中です');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.statItem}
        onPress={handlePostsPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{postsCount}</Text>
        <Text style={styles.statLabel}>投稿</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowersPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{followersCount}</Text>
        <Text style={styles.statLabel}>フォロワー</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowingPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statNumber}>{followingCount}</Text>
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
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#2A2A2A',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: Typography.fontSize.xxl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    marginBottom: Spacing.xs,
  },
  statLabel: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: '#2A2A2A',
  },
});
