import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ProfileHeader } from '../../components/profile/ProfileHeader';
import { ProfileStats } from '../../components/profile/ProfileStats';
import { PostGrid } from '../../components/profile/PostGrid';
import { User, Post } from '../../types/models';
import { RootStackParamList } from '../../navigation/RootNavigator';

type MyProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

// ダミーユーザーデータ
const DUMMY_USER: User = {
  id: 'currentUser',
  username: 'my_music_life',
  displayName: '音楽ライフ',
  bio: '音楽が人生🎵\n乃木坂46とSnow Man推し\n好きな曲をシェアしています',
  oshiGroup: '乃木坂46',
  oshiMember: '山下美月',
  createdAt: new Date(),
};

// ダミー投稿データ
const DUMMY_POSTS: Post[] = [
  {
    id: 'mypost1',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'playlist',
    caption: 'お気に入りプレイリスト',
    playlistTitle: 'My Favorite Songs',
    playlistTrackCount: 30,
    playlistService: 'spotify',
    likesCount: 45,
    commentsCount: 8,
    savesCount: 12,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mypost2',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'song',
    caption: '今日のお気に入り',
    songTitle: 'Sing Out!',
    songArtist: '乃木坂46',
    likesCount: 67,
    commentsCount: 15,
    savesCount: 23,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mypost3',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'playlist',
    caption: 'ドライブ用',
    playlistTitle: 'Drive Mix',
    playlistTrackCount: 25,
    playlistService: 'apple_music',
    likesCount: 34,
    commentsCount: 6,
    savesCount: 18,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mypost4',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'song',
    caption: 'この曲サイコー！',
    songTitle: 'D.D.',
    songArtist: 'Snow Man',
    likesCount: 89,
    commentsCount: 21,
    savesCount: 34,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mypost5',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'playlist',
    caption: '作業用BGM',
    playlistTitle: 'Work & Study',
    playlistTrackCount: 40,
    playlistService: 'spotify',
    likesCount: 56,
    commentsCount: 12,
    savesCount: 28,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'mypost6',
    userId: 'currentUser',
    author: DUMMY_USER,
    contentType: 'song',
    caption: '癒される〜',
    songTitle: 'ごめんねFingers crossed',
    songArtist: '乃木坂46',
    likesCount: 78,
    commentsCount: 18,
    savesCount: 31,
    isLiked: false,
    isSaved: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const MyProfileScreen: React.FC = () => {
  const navigation = useNavigation<MyProfileScreenNavigationProp>();

  const handlePostPress = (postId: string) => {
    navigation.navigate('PostDetail', { postId });
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* プロフィールヘッダー */}
        <ProfileHeader user={DUMMY_USER} />

        {/* 統計情報 */}
        <ProfileStats
          postsCount={DUMMY_POSTS.length}
          followersCount={234}
          followingCount={189}
        />

        {/* 投稿グリッド */}
        <PostGrid posts={DUMMY_POSTS} onPostPress={handlePostPress} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});
