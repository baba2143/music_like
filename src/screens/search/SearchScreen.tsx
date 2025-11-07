import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SearchBar } from '../../components/search/SearchBar';
import { UserSearchCard } from '../../components/search/UserSearchCard';
import { PostSearchCard } from '../../components/search/PostSearchCard';
import { User, Post } from '../../types/models';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { Colors, Spacing, Typography } from '../../config/theme';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

type TabType = 'all' | 'users' | 'posts';

// ダミーユーザーデータ
const DUMMY_USERS: User[] = [
  {
    id: 'user1',
    username: 'musiclover',
    displayName: '音楽太郎',
    createdAt: new Date(),
  },
  {
    id: 'user2',
    username: 'jazzfan',
    displayName: 'ジャズ好き',
    createdAt: new Date(),
  },
  {
    id: 'user3',
    username: 'rockstar',
    displayName: 'ロック魂',
    createdAt: new Date(),
  },
  {
    id: 'user4',
    username: 'popqueen',
    displayName: 'ポップス女王',
    createdAt: new Date(),
  },
  {
    id: 'user5',
    username: 'classicfan',
    displayName: 'クラシック愛好家',
    createdAt: new Date(),
  },
];

// ダミー投稿データ
const DUMMY_POSTS: Post[] = [
  {
    id: 'post1',
    userId: 'user1',
    author: DUMMY_USERS[0],
    contentType: 'playlist',
    caption: 'ドライブにぴったり',
    playlistTitle: 'Chill Vibes for Drive',
    playlistTrackCount: 25,
    playlistService: 'spotify',
    likesCount: 142,
    commentsCount: 23,
    savesCount: 56,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'post2',
    userId: 'user2',
    author: DUMMY_USERS[1],
    contentType: 'playlist',
    caption: 'ジャズの名曲集',
    playlistTitle: 'Best Jazz Collection',
    playlistTrackCount: 30,
    playlistService: 'apple_music',
    likesCount: 89,
    commentsCount: 12,
    savesCount: 34,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'post3',
    userId: 'user3',
    author: DUMMY_USERS[2],
    contentType: 'song',
    caption: '最高のロックナンバー',
    songTitle: 'Bohemian Rhapsody',
    songArtist: 'Queen',
    likesCount: 256,
    commentsCount: 45,
    savesCount: 123,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'post4',
    userId: 'user4',
    author: DUMMY_USERS[3],
    contentType: 'playlist',
    caption: 'ポップミュージック最新版',
    playlistTitle: 'Pop Hits 2024',
    playlistTrackCount: 50,
    playlistService: 'spotify',
    likesCount: 320,
    commentsCount: 67,
    savesCount: 180,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const SearchScreen: React.FC = () => {
  const navigation = useNavigation<SearchScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<TabType>('all');

  // 検索フィルタリング
  const filteredUsers = useMemo(() => {
    if (!searchQuery) return DUMMY_USERS;
    return DUMMY_USERS.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.displayName?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredPosts = useMemo(() => {
    if (!searchQuery) return DUMMY_POSTS;
    return DUMMY_POSTS.filter(
      (post) =>
        post.playlistTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.songTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.songArtist?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleUserPress = (userId: string) => {
    console.log('User pressed:', userId);
  };

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  // タブに応じた表示内容
  const renderContent = () => {
    if (activeTab === 'users') {
      return (
        <FlatList
          data={filteredUsers}
          renderItem={({ item }) => (
            <UserSearchCard user={item} onPress={handleUserPress} />
          )}
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

    if (activeTab === 'posts') {
      return (
        <FlatList
          data={filteredPosts}
          renderItem={({ item }) => (
            <PostSearchCard post={item} onPress={handlePostPress} />
          )}
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

    // すべてタブ
    return (
      <ScrollView showsVerticalScrollIndicator={false}>
        {filteredUsers.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ユーザー</Text>
            {filteredUsers.slice(0, 3).map((user) => (
              <UserSearchCard key={user.id} user={user} onPress={handleUserPress} />
            ))}
            {filteredUsers.length > 3 && (
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

        {filteredPosts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>投稿</Text>
            {filteredPosts.slice(0, 3).map((post) => (
              <PostSearchCard key={post.id} post={post} onPress={handlePostPress} />
            ))}
            {filteredPosts.length > 3 && (
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

        {filteredUsers.length === 0 && filteredPosts.length === 0 && (
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.huge,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
  },
});
