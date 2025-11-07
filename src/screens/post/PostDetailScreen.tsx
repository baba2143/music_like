import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Post, Comment } from '../../types/models';
import { CommentCard } from '../../components/post/CommentCard';
import { CommentInput } from '../../components/post/CommentInput';
import { Colors, Typography, Spacing } from '../../config/theme';

// ダミーデータ
const DUMMY_POST: Post = {
  id: '1',
  userId: 'user1',
  author: {
    id: 'user1',
    username: 'musiclover',
    displayName: '音楽太郎',
    avatarUrl: undefined,
    createdAt: new Date(),
  },
  contentType: 'playlist',
  caption: '最近のお気に入りプレイリスト🎵\nドライブ中に聴きたい曲を集めました！',
  playlistTitle: 'Chill Vibes for Drive',
  playlistThumbnail: 'https://via.placeholder.com/300',
  playlistTrackCount: 25,
  playlistService: 'spotify',
  likesCount: 142,
  commentsCount: 23,
  savesCount: 56,
  isLiked: false,
  isSaved: false,
  createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2時間前
  updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
};

const DUMMY_COMMENTS: Comment[] = [
  {
    id: 'c1',
    postId: '1',
    userId: 'user2',
    author: {
      id: 'user2',
      username: 'jazzfan',
      displayName: 'ジャズ好き',
      createdAt: new Date(),
    },
    content: 'このプレイリスト最高！ドライブが楽しくなりそう😊',
    createdAt: new Date(Date.now() - 60 * 60 * 1000), // 1時間前
  },
  {
    id: 'c2',
    postId: '1',
    userId: 'user3',
    author: {
      id: 'user3',
      username: 'rockstar',
      displayName: 'ロック魂',
      createdAt: new Date(),
    },
    content: 'Spotifyでフォローしました！',
    createdAt: new Date(Date.now() - 45 * 60 * 1000), // 45分前
  },
  {
    id: 'c3',
    postId: '1',
    userId: 'user4',
    author: {
      id: 'user4',
      username: 'popqueen',
      displayName: 'ポップス女王',
      createdAt: new Date(),
    },
    content: '同じようなプレイリスト作ってます！趣味が合いそう🎶',
    createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30分前
  },
];

export const PostDetailScreen: React.FC = () => {
  const navigation = useNavigation();

  const handleBack = () => {
    navigation.goBack();
  };

  const handleLike = () => {
    Alert.alert('準備中', 'いいね機能は準備中です');
  };

  const handleComment = () => {
    Alert.alert('準備中', 'コメント機能は準備中です');
  };

  const handleSave = () => {
    Alert.alert('準備中', '保存機能は準備中です');
  };

  const handlePlaylistPress = () => {
    Alert.alert('準備中', 'プレイリスト再生機能は準備中です');
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>投稿</Text>
        <View style={styles.backButton} />
      </View>

      {/* スクロール可能なコンテンツ */}
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* プレイリスト情報 */}
        <TouchableOpacity
          style={styles.playlistSection}
          onPress={handlePlaylistPress}
          activeOpacity={0.8}
        >
          {/* サムネイル */}
          <View style={styles.thumbnail}>
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>🎵</Text>
            </View>
          </View>

          {/* プレイリスト詳細 */}
          <View style={styles.playlistInfo}>
            <Text style={styles.playlistTitle}>{DUMMY_POST.playlistTitle}</Text>
            <Text style={styles.playlistDetails}>
              {DUMMY_POST.playlistTrackCount}曲 · Spotify
            </Text>
          </View>
        </TouchableOpacity>

        {/* 投稿者情報 */}
        <View style={styles.postInfo}>
          {/* ユーザー */}
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {DUMMY_POST.author.username.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View>
              <Text style={styles.username}>{DUMMY_POST.author.username}</Text>
              <Text style={styles.timestamp}>2時間前</Text>
            </View>
          </View>

          {/* キャプション */}
          {DUMMY_POST.caption && <Text style={styles.caption}>{DUMMY_POST.caption}</Text>}

          {/* アクションボタン */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleLike} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>♡</Text>
              <Text style={styles.actionCount}>{DUMMY_POST.likesCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleComment}
              activeOpacity={0.7}
            >
              <Text style={styles.actionIcon}>💬</Text>
              <Text style={styles.actionCount}>{DUMMY_POST.commentsCount}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleSave} activeOpacity={0.7}>
              <Text style={styles.actionIcon}>🔖</Text>
              <Text style={styles.actionCount}>{DUMMY_POST.savesCount}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* コメント一覧 */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>コメント ({DUMMY_COMMENTS.length})</Text>
          {DUMMY_COMMENTS.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))}
        </View>
      </ScrollView>

      {/* コメント入力 */}
      <CommentInput />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  playlistSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  placeholderImage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  placeholderText: {
    fontSize: 80,
  },
  playlistInfo: {
    gap: Spacing.xs,
  },
  playlistTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  playlistDetails: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  postInfo: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  avatarText: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  username: {
    fontSize: Typography.fontSize.base,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.white,
  },
  timestamp: {
    fontSize: Typography.fontSize.xs,
    color: '#808080',
  },
  caption: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    lineHeight: 22,
    marginBottom: Spacing.md,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionIcon: {
    fontSize: 20,
  },
  actionCount: {
    fontSize: Typography.fontSize.sm,
    color: '#808080',
  },
  commentsSection: {
    paddingTop: Spacing.md,
  },
  commentsTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
});
