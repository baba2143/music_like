import React, { useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { PostCard } from '../../components/post/PostCard';
import { Post } from '../../types/models';
import { mockPosts } from '../../utils/mockData';
import { Colors, Spacing, Typography } from '../../config/theme';

export const HomeScreen: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // リフレッシュ処理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    // 本番ではAPIからデータ取得
    setTimeout(() => {
      setPosts([...mockPosts]);
      setRefreshing(false);
    }, 1000);
  }, []);

  // いいねボタン
  const handleLike = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likesCount: post.isLiked ? post.likesCount - 1 : post.likesCount + 1,
            }
          : post
      )
    );
  }, []);

  // コメントボタン
  const handleComment = useCallback((postId: string) => {
    Alert.alert('準備中', 'コメント機能は準備中です');
  }, []);

  // 保存ボタン
  const handleSave = useCallback((postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isSaved: !post.isSaved,
            }
          : post
      )
    );
  }, []);

  // ユーザープロフィール表示
  const handlePressUser = useCallback((userId: string) => {
    Alert.alert('準備中', 'ユーザープロフィール画面は準備中です');
  }, []);

  // 投稿詳細表示
  const handlePressPost = useCallback((postId: string) => {
    Alert.alert('準備中', '投稿詳細画面は準備中です');
  }, []);

  // リストのアイテムレンダリング
  const renderItem = useCallback(
    ({ item }: { item: Post }) => (
      <PostCard
        post={item}
        onLike={handleLike}
        onComment={handleComment}
        onSave={handleSave}
        onPressUser={handlePressUser}
        onPressPost={handlePressPost}
      />
    ),
    [handleLike, handleComment, handleSave, handlePressUser, handlePressPost]
  );

  // 空の状態
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>投稿がありません</Text>
      <Text style={styles.emptySubtext}>下に引っ張って更新してください</Text>
    </View>
  );

  // フッター（ローディング）
  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={Colors.primary} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Music Like</Text>
      </View>

      {/* フィード */}
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.gray50,
  },
  header: {
    backgroundColor: Colors.white,
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.primary,
  },
  listContent: {
    paddingVertical: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.md,
    fontWeight: Typography.fontWeight.semiBold,
    color: Colors.gray700,
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: Colors.gray500,
  },
  footer: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
});
