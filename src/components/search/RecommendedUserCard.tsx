import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { User } from '../../types/models';
import { Colors, Spacing, Typography } from '../../config/theme';

interface RecommendedUserCardProps {
  user: User;
  isFollowing: boolean;
  onPress: (userId: string) => void;
  onFollow: (userId: string) => void;
}

export const RecommendedUserCard: React.FC<RecommendedUserCardProps> = ({
  user,
  isFollowing,
  onPress,
  onFollow,
}) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => onPress(user.id)} activeOpacity={0.7}>
        <View style={styles.avatarContainer}>
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</Text>
            </View>
          )}
        </View>
        <Text style={styles.username} numberOfLines={1}>
          {user.username}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.followButton, isFollowing && styles.followingButton]}
        onPress={() => onFollow(user.id)}
        activeOpacity={0.7}
      >
        <Text style={styles.followButtonText}>{isFollowing ? 'フォロー中' : 'フォロー'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarContainer: {
    marginBottom: Spacing.xs,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: Typography.fontWeight.bold,
    color: '#808080',
  },
  username: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.medium,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },
  followButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: 16,
  },
  followingButton: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  followButtonText: {
    fontSize: Typography.fontSize.xs,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
});
