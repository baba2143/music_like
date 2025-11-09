import React, { useState, useCallback, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../../components/search/SearchBar';
import { UserSearchCard } from '../../components/search/UserSearchCard';
import { PostSearchCard } from '../../components/search/PostSearchCard';
import { User, Post } from '../../types/models';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors, Spacing, Typography } from '../../config/theme';
import { searchUsers } from '../../services/userService';
import { getFeedPosts } from '../../services/postService';
import { useAuth } from '../../contexts/AuthContext';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'users' | 'posts' | 'hashtags';

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [hashtagPosts, setHashtagPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounce用のrefとタイマー
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // ハッシュタグ検索かどうかを判定
  const isHashtagSearch = searchQuery.trim().startsWith('#');

  // 検索実行（API呼び出し）
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setHashtagPosts([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ハッシュタグ検索の場合
      const isHashtag = query.trim().startsWith('#');
      const hashtag = isHashtag ? query.trim().substring(1).toLowerCase() : '';

      if (isHashtag && hashtag) {
        // ハッシュタグ検索のみ実行
        const postsResult = await getFeedPosts(user?.id, 50);

        if (postsResult.error) {
          console.error('ハッシュタグ検索エラー:', postsResult.error);
        } else if (postsResult.data) {
          // ハッシュタグで完全一致または部分一致
          const hashtagFiltered = postsResult.data.posts.filter((post) =>
            post.hashtags?.some((tag) => tag.toLowerCase().includes(hashtag))
          );
          setHashtagPosts(hashtagFiltered);
          setUsers([]);
          setPosts([]);
        }
      } else {
        // 通常検索（ユーザーと投稿）
        const [usersResult, postsResult] = await Promise.all([
          searchUsers(query, 20),
          getFeedPosts(user?.id, 20),
        ]);

        if (usersResult.error) {
          console.error('ユーザー検索エラー:', usersResult.error);
        } else {
          setUsers(usersResult.data);
        }

        if (postsResult.error) {
          console.error('投稿検索エラー:', postsResult.error);
        } else if (postsResult.data) {
          // 投稿はキャプションやハッシュタグで絞り込み
          const filteredPosts = postsResult.data.posts.filter((post) => {
            const searchLower = query.toLowerCase();
            return (
              post.caption?.toLowerCase().includes(searchLower) ||
              post.hashtags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
              post.playlistTitle?.toLowerCase().includes(searchLower) ||
              post.trackTitle?.toLowerCase().includes(searchLower) ||
              post.trackArtist?.toLowerCase().includes(searchLower) ||
              post.author.username.toLowerCase().includes(searchLower) ||
              post.author.displayName?.toLowerCase().includes(searchLower)
            );
          });
          setPosts(filteredPosts);
        }

        setHashtagPosts([]);
      }
    } catch (err) {
      console.error('検索エラー:', err);
      setError('検索に失敗しました');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Debounce付き検索クエリ変更ハンドラ
  useEffect(() => {
    // 既存のタイマーをクリア
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // 新しいタイマーをセット（300ms後に検索実行）
    debounceTimer.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    // クリーンアップ
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery, performSearch]);

  const handleUserPress = (userId: string) => {
    navigation.navigate('UserProfile', { userId });
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setUsers([]);
    setPosts([]);
    setHashtagPosts([]);
    setError(null);
  };

  // タブに応じた表示内容
  const renderContent = () => {
    // ローディング中
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>検索中...</Text>
        </View>
      );
    }

    // エラー表示
    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => performSearch(searchQuery)}
            activeOpacity={0.7}
          >
            <Text style={styles.retryButtonText}>再試行</Text>
          </TouchableOpacity>
        </View>
      );
    }

    // 検索クエリが空の場合
    if (!searchQuery.trim()) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ユーザーや曲を検索してみましょう</Text>
        </View>
      );
    }

    // ユーザータブ
    if (activeTab === 'users') {
      return (
        <FlatList
          data={users}
          renderItem={({ item }) => <UserSearchCard user={item} onPress={handleUserPress} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>ユーザーが見つかりません</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // 投稿タブ
    if (activeTab === 'posts') {
      return (
        <FlatList
          data={posts}
          renderItem={({ item }) => <PostSearchCard post={item} onPress={handlePostPress} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>投稿が見つかりません</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // ハッシュタグタブ
    if (activeTab === 'hashtags') {
      return (
        <FlatList
          data={hashtagPosts}
          renderItem={({ item }) => <PostSearchCard post={item} onPress={handlePostPress} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {isHashtagSearch
                  ? 'このハッシュタグを含む投稿が見つかりません'
                  : '#を入力してハッシュタグを検索'}
              </Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      );
    }

    // すべてタブ
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* ハッシュタグ検索の場合 */}
        {isHashtagSearch && hashtagPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ハッシュタグ投稿</Text>
            {hashtagPosts.slice(0, 5).map((post) => (
              <PostSearchCard key={post.id} post={post} onPress={handlePostPress} />
            ))}
            {hashtagPosts.length > 5 && (
              <TouchableOpacity
                style={styles.showMoreButton}
                onPress={() => setActiveTab('hashtags')}
                activeOpacity={0.7}
              >
                <Text style={styles.showMoreText}>もっと見る</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* 通常検索の場合 */}
        {!isHashtagSearch && (
          <>
            {users.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>ユーザー</Text>
                {users.slice(0, 3).map((user) => (
                  <UserSearchCard key={user.id} user={user} onPress={handleUserPress} />
                ))}
                {users.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setActiveTab('users')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreText}>もっと見る</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {posts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>投稿</Text>
                {posts.slice(0, 3).map((post) => (
                  <PostSearchCard key={post.id} post={post} onPress={handlePostPress} />
                ))}
                {posts.length > 3 && (
                  <TouchableOpacity
                    style={styles.showMoreButton}
                    onPress={() => setActiveTab('posts')}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.showMoreText}>もっと見る</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </>
        )}

        {/* 空の状態 */}
        {isHashtagSearch && hashtagPosts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>このハッシュタグを含む投稿が見つかりません</Text>
          </View>
        )}
        {!isHashtagSearch && users.length === 0 && posts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>検索結果がありません</Text>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>探す</Text>
      </View>

      {/* 検索バー */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="ユーザーや曲を検索"
        onClear={handleClearSearch}
      />

      {/* タブ */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'all' && styles.tabActive]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}>
            すべて
          </Text>
        </TouchableOpacity>
        {!isHashtagSearch && (
          <>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'users' && styles.tabActive]}
              onPress={() => setActiveTab('users')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
                ユーザー
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
              onPress={() => setActiveTab('posts')}
              activeOpacity={0.7}
            >
              <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
                投稿
              </Text>
            </TouchableOpacity>
          </>
        )}
        {isHashtagSearch && (
          <TouchableOpacity
            style={[styles.tab, activeTab === 'hashtags' && styles.tabActive]}
            onPress={() => setActiveTab('hashtags')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'hashtags' && styles.tabTextActive]}>
              ハッシュタグ
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* コンテンツ */}
      {renderContent()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingVertical: Spacing.base,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  headerTitle: {
    fontSize: Typography.fontSize.xl,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    paddingHorizontal: Spacing.base,
  },
  tab: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    marginRight: Spacing.sm,
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    fontWeight: Typography.fontWeight.medium,
  },
  tabTextActive: {
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  section: {
    marginTop: Spacing.md,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  showMoreButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    alignItems: 'center',
  },
  showMoreText: {
    fontSize: Typography.fontSize.base,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  loadingText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    marginTop: Spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: 20,
  },
  retryButtonText: {
    fontSize: Typography.fontSize.base,
    color: Colors.white,
    fontWeight: Typography.fontWeight.semiBold,
  },
});
