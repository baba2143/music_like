import React from 'react';
import { TouchableOpacity, Text, View, Image, StyleSheet } from 'react-native';
import { Colors, Spacing, Typography } from '../../config/theme';

interface PlaylistCardProps {
  id: string;
  title: string;
  author: string;
  imageUrl?: string;
  onPress: (id: string) => void;
}

export const PlaylistCard: React.FC<PlaylistCardProps> = ({
  id,
  title,
  author,
  imageUrl,
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(id)}
      activeOpacity={0.7}
    >
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        by {author}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 120,
    marginRight: Spacing.md,
  },
  imageContainer: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    marginBottom: Spacing.xs,
  },
  image: {
    flex: 1,
  },
  placeholder: {
    flex: 1,
    backgroundColor: '#D4C5B0',
  },
  title: {
    fontSize: Typography.fontSize.sm,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
    marginBottom: 2,
  },
  author: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
});
