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
import { IdolGroupTag } from '../../components/search/IdolGroupTag';
import { PlaylistCard } from '../../components/search/PlaylistCard';
import { RecommendedUserCard } from '../../components/search/RecommendedUserCard';
import { User, Post } from '../../types/models';
import { SearchStackParamList } from '../../navigation/RootNavigator';
import { Colors, Spacing, Typography } from '../../config/theme';
import { searchUsers } from '../../services/userService';
import { getFeedPosts } from '../../services/postService';
import { toggleFollow, checkIsFollowing } from '../../services/followService';
import { useAuth } from '../../contexts/AuthContext';

type SearchScreenNavigationProp = NativeStackNavigationProp<SearchStackParamList>;

type TabType = 'posts' | 'playlists' | 'users';

// 仮データ
const IDOL_GROUPS = ['乃木坂46', '櫻坂46', '日向坂46', 'IVE', 'TWICE', 'NewJeans'];

const MOCK_PLAYLISTS = [
  { id: '1', title: 'Summer Hits 2024', author: 'vdkr_7' },
  { id: '2', title: 'Upbeat J-Pop Mix', author: 'idol_fan_22' },
  { id: '3', title: 'K-Pop Favorites', author: 'kpop_lover' },
  { id: '4', title: 'Chill Vibes', author: 'music_curator' },
  { id: '5', title: 'Party Mix', author: 'dj_mike' },
];

const MOCK_RECOMMENDED_USERS: User[] = [
  {
    id: 'rec1',
    username: 'aiko_music',
    displayName: 'Aiko',
    bio: '音楽好き',
    oshiGroup: '乃木坂46',
    oshiMember: undefined,
    avatarUrl: undefined,
    createdAt: new Date(),
  },
  {
    id: 'rec2',
    username: 'Tsubasa_idol',
    displayName: 'Tsubasa',
    bio: 'アイドル好き',
    oshiGroup: '櫻坂46',
    oshiMember: undefined,
    avatarUrl: undefined,
    createdAt: new Date(),
  },
  {
    id: 'rec3',
    username: 'haru_oshi',
    displayName: 'Haru',
    bio: 'K-POP好き',
    oshiGroup: 'IVE',
    oshiMember: undefined,
    avatarUrl: undefined,
    createdAt: new Date(),
  },
  {
    id: 'rec4',
    username: 'music_fan99',
    displayName: 'Music Fan',
    bio: '音楽好き',
    oshiGroup: undefined,
    oshiMember: undefined,
    avatarUrl: undefined,
    createdAt: new Date(),
  },
  {
    id: 'rec5',
    username: 'jpop_lover',
    displayName: 'J-Pop Lover',
    bio: 'J-POP好き',
    oshiGroup: '日向坂46',
    oshiMember: undefined,
    avatarUrl: undefined,
    createdAt: new Date(),
  },
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('posts');
  const [users, setUsers] = useState<User[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [playlistPosts, setPlaylistPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>({});

  // Debounce用のrefとタイマー
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 検索実行（API呼び出し）
  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setUsers([]);
      setPosts([]);
      setPlaylistPosts([]);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ユーザーと投稿を並列取得
      const [usersResult, postsResult] = await Promise.all([
        searchUsers(query, 50),
        getFeedPosts(user?.id, 50),
      ]);

      if (usersResult.error) {
        console.error('ユーザー検索エラー:', usersResult.error);
      } else {
        setUsers(usersResult.data);
      }

      if (postsResult.error) {
        console.error('投稿検索エラー:', postsResult.error);
      } else if (postsResult.data) {
        const searchLower = query.toLowerCase();

        // 投稿を絞り込み（プレイリスト以外）
        const filteredPosts = postsResult.data.posts.filter((post) => {
          const matchesSearch =
            post.caption?.toLowerCase().includes(searchLower) ||
            post.hashtags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
            post.trackTitle?.toLowerCase().includes(searchLower) ||
            post.trackArtist?.toLowerCase().includes(searchLower) ||
            post.author.username.toLowerCase().includes(searchLower) ||
            post.author.displayName?.toLowerCase().includes(searchLower);

          return matchesSearch && post.contentType !== 'playlist';
        });

        // プレイリスト投稿を絞り込み
        const filteredPlaylists = postsResult.data.posts.filter((post) => {
          const matchesSearch =
            post.caption?.toLowerCase().includes(searchLower) ||
            post.hashtags?.some((tag) => tag.toLowerCase().includes(searchLower)) ||
            post.playlistTitle?.toLowerCase().includes(searchLower) ||
            post.author.username.toLowerCase().includes(searchLower) ||
            post.author.displayName?.toLowerCase().includes(searchLower);

          return matchesSearch && post.contentType === 'playlist';
        });

        setPosts(filteredPosts);
        setPlaylistPosts(filteredPlaylists);
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
    setPlaylistPosts([]);
    setError(null);
  };

  const handleIdolGroupTagPress = (groupName: string) => {
    setSearchQuery(groupName);
    setActiveTab('posts');
  };

  const handlePlaylistPress = (playlistId: string) => {
    // TODO: プレイリスト詳細画面に遷移
    console.log('Playlist pressed:', playlistId);
  };

  const handleFollowToggle = async (userId: string) => {
    if (!user) {
      window.alert('ログインが必要です');
      return;
    }

    try {
      const { isFollowing, error } = await toggleFollow(user.id, userId);

      if (error) {
        console.error('フォロー切り替えエラー:', error);
        window.alert('エラー: フォローの切り替えに失敗しました');
        return;
      }

      setFollowingMap((prev) => ({
        ...prev,
        [userId]: isFollowing,
      }));
    } catch (err) {
      console.error('Failed to toggle follow:', err);
      window.alert('エラー: 予期しないエラーが発生しました');
    }
  };

  // デフォルトビュー（検索が空の時）
  const renderDefaultView = () => {
    return (
      <ScrollView showsVerticalScrollIndicator={false} style={styles.defaultView}>
        {/* 人気のアイドルグループ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>人気のアイドルグループ</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tagsScroll}>
            {IDOL_GROUPS.map((group) => (
              <IdolGroupTag key={group} name={group} onPress={handleIdolGroupTagPress} />
            ))}
          </ScrollView>
        </View>

        {/* 人気プレイリスト */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>人気プレイリスト</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.moreText}>もっと見る</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.playlistsScroll}
          >
            {MOCK_PLAYLISTS.map((playlist) => (
              <PlaylistCard
                key={playlist.id}
                id={playlist.id}
                title={playlist.title}
                author={playlist.author}
                onPress={handlePlaylistPress}
              />
            ))}
          </ScrollView>
        </View>

        {/* おすすめユーザー */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>おすすめユーザー</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.moreText}>もっと見る</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.usersScroll}>
            {MOCK_RECOMMENDED_USERS.map((recommendedUser) => (
              <RecommendedUserCard
                key={recommendedUser.id}
                user={recommendedUser}
                isFollowing={followingMap[recommendedUser.id] || false}
                onPress={handleUserPress}
                onFollow={handleFollowToggle}
              />
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    );
  };

  // タブに応じた表示内容（検索結果）
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

    // 検索クエリが空の場合はデフォルトビュー
    if (!searchQuery.trim()) {
      return renderDefaultView();
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

    // プレイリストタブ
    if (activeTab === 'playlists') {
      return (
        <FlatList
          data={playlistPosts}
          renderItem={({ item }) => <PostSearchCard post={item} onPress={handlePostPress} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>プレイリストが見つかりません</Text>
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
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

    return null;
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
        placeholder="プレイリスト・ユーザーを検索"
        onClear={handleClearSearch}
      />

      {/* タブ（検索時のみ表示） */}
      {searchQuery.trim() && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'posts' && styles.tabActive]}
            onPress={() => setActiveTab('posts')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>
              投稿
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'playlists' && styles.tabActive]}
            onPress={() => setActiveTab('playlists')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'playlists' && styles.tabTextActive]}>
              プレイリスト
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'users' && styles.tabActive]}
            onPress={() => setActiveTab('users')}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabText, activeTab === 'users' && styles.tabTextActive]}>
              ユーザー
            </Text>
          </TouchableOpacity>
        </View>
      )}

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
  defaultView: {
    flex: 1,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  moreText: {
    fontSize: Typography.fontSize.sm,
    color: Colors.primary,
    fontWeight: Typography.fontWeight.semiBold,
  },
  tagsScroll: {
    paddingHorizontal: Spacing.base,
  },
  playlistsScroll: {
    paddingHorizontal: Spacing.base,
  },
  usersScroll: {
    paddingHorizontal: Spacing.base,
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
