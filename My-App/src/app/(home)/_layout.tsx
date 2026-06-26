import { useEffect, useRef } from 'react';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '@clerk/expo';
import Header from '@/components/header';
import ModernTabBar from '@/components/modern-tab-bar';
import { syncClerkToSanctum } from '@/lib/api-client';
import { saveAccount } from '@/lib/accounts-storage';

export default function HomeLayout() {
  const { user } = useUser();
  const synced = useRef(false);

  useEffect(() => {
    if (!user || synced.current) return;
    synced.current = true;

    const email = user.primaryEmailAddress?.emailAddress || '';
    const name = user.fullName || email.split('@')[0];
    const avatarUrl = user.imageUrl;

    syncClerkToSanctum(user.id, email, name, avatarUrl)
      .then(() => saveAccount({ clerkId: user.id, email, name, avatarUrl }))
      .catch(() => {});
  }, [user]);

  return (
    <Tabs
      tabBar={(props) => <ModernTabBar {...props} />}
      screenOptions={{
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          header: () => <Header />,
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
        name="messages"
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
        name="profile"
        options={{
          title: 'Profile',
          headerShown: false,
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
      <Tabs.Screen
        name="packages"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="products"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="reviews"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="edit-profile"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="help"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="histories"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="languages"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings-notification"
        options={{
          href: null,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="vouchers"
        options={{
          href: null,
          headerShown: false,
        }}
      />
    </Tabs>
  );
}
