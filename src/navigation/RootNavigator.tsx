import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Alert, Text } from 'react-native';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { ProfileSetupStep1Screen } from '../screens/profile/ProfileSetupStep1Screen';
import { ProfileSetupStep2Screen } from '../screens/profile/ProfileSetupStep2Screen';
import { ProfileSetupStep3Screen } from '../screens/profile/ProfileSetupStep3Screen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { PostDetailScreen } from '../screens/post/PostDetailScreen';
import { Colors, Typography } from '../config/theme';

// ルートスタック画面の型定義
export type RootStackParamList = {
  Login: undefined;
  ProfileSetupStep1: undefined;
  ProfileSetupStep2: undefined;
  ProfileSetupStep3: undefined;
  MainTabs: undefined;
  PostDetail: { postId: string };
};

// タブ画面の型定義
export type MainTabParamList = {
  Home: undefined;
  Search: undefined;
  Post: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const PostPlaceholder = () => {
  Alert.alert('準備中', '投稿機能は準備中です');
  return null;
};

// Tab icon components (defined outside to avoid unstable nested components)
const HomeIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🏠</Text>;
const SearchIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>🔍</Text>;
const PostIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>➕</Text>;
const NotificationIcon = ({ size }: { size: number }) => (
  <Text style={{ fontSize: size }}>🔔</Text>
);
const ProfileIcon = ({ size }: { size: number }) => <Text style={{ fontSize: size }}>👤</Text>;

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
        component={HomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: HomeIcon,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '探す',
          tabBarIcon: SearchIcon,
        }}
      />
      <Tab.Screen
        name="Post"
        component={PostPlaceholder}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            Alert.alert('準備中', '投稿機能は準備中です');
          },
        }}
        options={{
          tabBarLabel: '投稿',
          tabBarIcon: PostIcon,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: '通知',
          tabBarIcon: NotificationIcon,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MyProfileScreen}
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
      <Stack.Screen name="PostDetail" component={PostDetailScreen} />
    </Stack.Navigator>
  );
};
