import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { PostCard } from '../../components/post/PostCard';
import { Post } from '../../types/models';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors, Spacing, Typography } from '../../config/theme';
import { useAuth } from '../../contexts/AuthContext';
import { getFeedPosts, toggleLike, toggleSave } from '../../services/postService';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // 投稿を取得
  const fetchPosts = useCallback(async () => {
    try {
      console.log('投稿を取得中...');
      const { data, error } = await getFeedPosts(user?.id, 20);

      if (error) {
        console.error('投稿取得エラー:', error);
        window.alert('エラー: 投稿の取得に失敗しました');
        return;
      }

      if (data) {
        console.log('取得した投稿数:', data.posts.length);
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  }, [user]);

  // 初回ロード
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // リフレッシュ処理
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, [fetchPosts]);

  // いいねボタン
  const handleLike = useCallback(async (postId: string) => {
    if (!user) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      const { isLiked, error } = await toggleLike(postId, user.id);

      if (error) {
        console.error('いいねエラー:', error);
        window.alert('エラー: いいねに失敗しました');
        return;
      }

      // ローカルステートを更新
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isLiked,
                likesCount: isLiked ? post.likesCount + 1 : post.likesCount - 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to toggle like:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  }, [user]);

  // コメントボタン
  const handleComment = useCallback(
    (postId: string) => {
      navigation.navigate('PostDetail', { postId });
    },
    [navigation]
  );

  // 保存ボタン
  const handleSave = useCallback(async (postId: string) => {
    if (!user) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      const { isSaved, error } = await toggleSave(postId, user.id);

      if (error) {
        console.error('保存エラー:', error);
        window.alert('エラー: 保存に失敗しました');
        return;
      }

      // ローカルステートを更新
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId
            ? {
                ...post,
                isSaved,
                savesCount: isSaved ? post.savesCount + 1 : post.savesCount - 1,
              }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to toggle save:', error);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  }, [user]);

  // ユーザープロフィール表示
  const handlePressUser = useCallback((_userId: string) => {
    window.alert('準備中: ユーザープロフィール画面は準備中です');
  }, []);

  // 投稿詳細表示
  const handlePressPost = useCallback(
    (postId: string) => {
      navigation.navigate('PostDetail', { postId });
    },
    [navigation]
  );

  // リストのアイテムレンダリング
  const renderItem = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
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
    backgroundColor: '#000000', // 真っ黒背景
  },
  header: {
    backgroundColor: '#000000', // 真っ黒背景
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A', // 暗いボーダー
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white, // 白文字
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
    color: Colors.white, // 白文字
    marginBottom: Spacing.xs,
  },
  emptySubtext: {
    fontSize: Typography.fontSize.sm,
    color: '#808080', // グレー文字
  },
  footer: {
    paddingVertical: Spacing.base,
    alignItems: 'center',
  },
});
