import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { HomeScreen } from '../screens/home/HomeScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { NotificationScreen } from '../screens/notifications/NotificationScreen';
import { MyProfileScreen } from '../screens/profile/MyProfileScreen';
import { Colors, Typography } from '../config/theme';
import { Alert } from 'react-native';

export type RootTabParamList = {
  Home: undefined;
  Search: undefined;
  Post: undefined;
  Notifications: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const PostPlaceholder = () => {
  Alert.alert('準備中', '投稿機能は準備中です');
  return null;
};

export const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: Colors.gray200,
          backgroundColor: Colors.white,
        },
        tabBarLabelStyle: {
          fontSize: Typography.fontSize.xs,
          fontWeight: Typography.fontWeight.medium,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'ホーム',
          tabBarIcon: ({ color, size }) => <span style={{ fontSize: size }}>🏠</span>,
        }}
      />
      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: '探す',
          tabBarIcon: ({ color, size }) => <span style={{ fontSize: size }}>🔍</span>,
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
          tabBarIcon: ({ color, size }) => <span style={{ fontSize: size }}>➕</span>,
        }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          tabBarLabel: '通知',
          tabBarIcon: ({ color, size }) => <span style={{ fontSize: size }}>🔔</span>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={MyProfileScreen}
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ({ color, size }) => <span style={{ fontSize: size }}>👤</span>,
        }}
      />
    </Tab.Navigator>
  );
};
