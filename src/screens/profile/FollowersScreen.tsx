import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { User } from '../../types/models';
import { UserSearchCard } from '../../components/search/UserSearchCard';
import { Colors, Spacing, Typography } from '../../config/theme';
import { getFollowers } from '../../services/followService';

type FollowersScreenRouteProp = RouteProp<RootStackParamList, 'Followers'>;
type FollowersScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

export const FollowersScreen: React.FC = () => {
  const route = useRoute<FollowersScreenRouteProp>();
  const navigation = useNavigation<FollowersScreenNavigationProp>();
  const { userId, username } = route.params;

  const [followers, setFollowers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // フォロワー一覧を取得
  const fetchFollowers = useCallback(async () => {
    try {
      setError(null);
      const { data, error: fetchError } = await getFollowers(userId);

      if (fetchError) {
        console.error('フォロワー取得エラー:', fetchError);
        setError('フォロワーの取得に失敗しました');
        return;
      }

      setFollowers(data || []);
    } catch (err) {
      console.error('Failed to fetch followers:', err);
      setError('予期しないエラーが発生しました');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFollowers();
  }, [fetchFollowers]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFollowers();
  }, [fetchFollowers]);

  const handleUserPress = (userId: string) => {
    navigation.push('UserProfile', { userId });
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {username ? `@${username}のフォロワー` : 'フォロワー'}
      </Text>
      <View style={styles.backButton} />
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>
        {error || 'フォロワーがいません'}
      </Text>
      {error && (
        <TouchableOpacity
          style={styles.retryButton}
          onPress={fetchFollowers}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>再試行</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        data={followers}
        renderItem={({ item }) => (
          <UserSearchCard user={item} onPress={() => handleUserPress(item.id)} />
        )}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
            colors={[Colors.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
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
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: Typography.fontSize.xl,
    color: Colors.white,
  },
  headerTitle: {
    fontSize: Typography.fontSize.lg,
    fontWeight: Typography.fontWeight.bold,
    color: Colors.white,
  },
  listContent: {
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    paddingHorizontal: Spacing.xl,
  },
  emptyText: {
    fontSize: Typography.fontSize.base,
    color: '#808080',
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  retryButton: {
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
