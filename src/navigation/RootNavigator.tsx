import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ProfileSetupStep1Screen } from '../screens/profile/ProfileSetupStep1Screen';
import { ProfileSetupStep2Screen } from '../screens/profile/ProfileSetupStep2Screen';
import { ProfileSetupStep3Screen } from '../screens/profile/ProfileSetupStep3Screen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { EditProfileScreen } from '../screens/profile/EditProfileScreen';
import { UserProfileScreen } from '../screens/profile/UserProfileScreen';
import { FollowersScreen } from '../screens/profile/FollowersScreen';
import { FollowingScreen } from '../screens/profile/FollowingScreen';
import { PostDetailScreen } from '../screens/post/PostDetailScreen';
import { CreatePostScreen } from '../screens/post/CreatePostScreen';
import { EditPostScreen } from '../screens/post/EditPostScreen';
import { MessagesScreen } from '../screens/messages/MessagesScreen';
import { ChatScreen } from '../screens/messages/ChatScreen';
import { CreatePlaylistScreen } from '../screens/playlist/CreatePlaylistScreen';
import { PlaylistDetailScreen } from '../screens/playlist/PlaylistDetailScreen';
import { AddTrackToPlaylistScreen } from '../screens/playlist/AddTrackToPlaylistScreen';
import { Colors, Typography } from '../config/theme';
import { User } from '../types/models';

// ルートスタック画面の型定義
export type RootStackParamList = {
  Login: undefined;
  ProfileSetupStep1: undefined;
  ProfileSetupStep2: undefined;
  ProfileSetupStep3: undefined;
  MainTabs: undefined;
  CreatePost: { playlistId?: string } | undefined;
  EditPost: { postId: string };
};

// タブ画面の型定義
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Post: undefined;
  Messages: undefined;
  Notifications: undefined;
  Profile: undefined;
};

// 各タブのスタック型定義
export type HomeStackParamList = {
  HomeMain: undefined;
  PostDetail: { postId: string };
  UserProfile: { userId: string };
};

export type SearchStackParamList = {
  SearchMain: undefined;
  UserProfile: { userId: string };
  PostDetail: { postId: string };
};

export type MessagesStackParamList = {
  MessagesMain: undefined;
  Chat: { conversationId?: string; otherUser: User };
};

export type NotificationsStackParamList = {
  NotificationsMain: undefined;
  PostDetail: { postId: string };
  UserProfile: { userId: string };
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
  UserProfile: { userId: string };
  EditProfile: undefined;
  CreatePlaylist: undefined;
  PlaylistDetail: { playlistId: string };
  AddTrack: { playlistId: string };
  Followers: { userId: string; username?: string };
  Following: { userId: string; username?: string };
  Chat: { conversationId?: string; otherUser: User };
  PostDetail: { postId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const HomeStack = createNativeStackNavigator<HomeStackParamList>();
const SearchStack = createNativeStackNavigator<SearchStackParamList>();
const MessagesStack = createNativeStackNavigator<MessagesStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();

// 投稿タブ用のプレースホルダー（実際には表示されない）
const PostPlaceholder = () => null;

// Tab icon components (defined outside to avoid unstable nested components)
const HomeIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🏠</Text>;
const SearchIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🔍</Text>;
const PostIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>➕</Text>;
const MessagesIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>💬</Text>;
const NotificationIcon = ({ size }: { size: number }) => (
  <Text style={{ fontSize: size }}>🔔</Text>
);
const ProfileIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>👤</Text>;

// ホームタブのスタックナビゲーター
const HomeStackScreen = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain" component={HomeScreen} />
      <HomeStack.Screen name="PostDetail" component={PostDetailScreen} />
      <HomeStack.Screen name="UserProfile" component={UserProfileScreen} />
    </HomeStack.Navigator>
  );
};

// 検索タブのスタックナビゲーター
const SearchStackScreen = () => {
  return (
    <SearchStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <SearchStack.Screen name="SearchMain" component={SearchScreen} />
      <SearchStack.Screen name="UserProfile" component={UserProfileScreen} />
      <SearchStack.Screen name="PostDetail" component={PostDetailScreen} />
    </SearchStack.Navigator>
  );
};

// メッセージタブのスタックナビゲーター
const MessagesStackScreen = () => {
  return (
    <MessagesStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <MessagesStack.Screen name="MessagesMain" component={MessagesScreen} />
      <MessagesStack.Screen name="Chat" component={ChatScreen} />
    </MessagesStack.Navigator>
  );
};

// 通知タブのスタックナビゲーター
const NotificationsStackScreen = () => {
  return (
    <NotificationsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <NotificationsStack.Screen name="NotificationsMain" component={NotificationScreen} />
      <NotificationsStack.Screen name="PostDetail" component={PostDetailScreen} />
      <NotificationsStack.Screen name="UserProfile" component={UserProfileScreen} />
    </NotificationsStack.Navigator>
  );
};

// プロフィールタブのスタックナビゲーター
const ProfileStackScreen = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileMain" component={MyProfileScreen} />
      <ProfileStack.Screen name="UserProfile" component={UserProfileScreen} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
      <ProfileStack.Screen name="CreatePlaylist" component={CreatePlaylistScreen} />
      <ProfileStack.Screen name="PlaylistDetail" component={PlaylistDetailScreen} />
      <ProfileStack.Screen name="AddTrack" component={AddTrackToPlaylistScreen} />
      <ProfileStack.Screen name="Followers" component={FollowersScreen} />
      <ProfileStack.Screen name="Following" component={FollowingScreen} />
      <ProfileStack.Screen name="Chat" component={ChatScreen} />
      <ProfileStack.Screen name="PostDetail" component={PostDetailScreen} />
    </ProfileStack.Navigator>
  );
};

// メインのタブナビゲーション
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary, // ピンク
        tabBarInactiveTintColor: '#808080', // グレー
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#2A2A2A', // 暗いボーダー
          backgroundColor: '#000000', // 真っ黒背景
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium as any,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeStackScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchStackScreen}
        options={{
          tabBarLabel: '探す',
          tabBarIcon: SearchIcon,
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostPlaceholder}
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            // @ts-ignore - 親のStack Navigatorに遷移
            navigation.getParent()?.navigate('CreatePost');
          },
        })}
        options={{
          tabBarLabel: '投稿',
          tabBarIcon: PostIcon,
        }}
      />
      <Tab.Screen
        name="Messages"
        component={MessagesStackScreen}
        options={{
          tabBarLabel: 'DM',
          tabBarIcon: MessagesIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsStackScreen}
        options={{
          tabBarLabel: '通知',
          tabBarIcon: NotificationIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileStackScreen}
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ProfileIcon,
        }}
      />
    </Tab.Navigator>
  );
};

// ルートナビゲーター（ログイン → プロフィール作成 → メイン）
export const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ProfileSetupStep1" component={ProfileSetupStep1Screen} />
      <Stack.Screen name="ProfileSetupStep2" component={ProfileSetupStep2Screen} />
      <Stack.Screen name="ProfileSetupStep3" component={ProfileSetupStep3Screen} />
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {/* モーダル表示の画面 */}
      <Stack.Screen
        name="CreatePost"
        component={CreatePostScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="EditPost"
        component={EditPostScreen}
        options={{
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
};
