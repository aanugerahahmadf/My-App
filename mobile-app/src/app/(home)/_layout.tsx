import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Platform, useColorScheme } from 'react-native';
import { useUser } from '@clerk/expo';

import { Colors } from '@/constants/theme';
import Header from '@/components/header';
import { syncClerkToSanctum } from '@/lib/api-client';

export default function HomeLayout() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;

    const email = user.primaryEmailAddress?.emailAddress || '';
    const name = user.fullName || email.split('@')[0];
    const avatarUrl = user.imageUrl;

    syncClerkToSanctum(user.id, email, name, avatarUrl).catch(() => {});
  }, [user]);

  return (
    <Tabs
      screenOptions={{
        header: () => <Header />,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.backgroundSelected,
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 25 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          fontFamily: Platform.OS === 'ios' ? 'Inter' : 'Inter',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="order"
        options={{
          title: 'Pesanan',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Keranjang',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cart-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          title: 'Chat',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="chatbubble-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cbir"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
