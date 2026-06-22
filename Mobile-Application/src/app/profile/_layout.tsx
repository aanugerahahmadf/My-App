import { Stack } from 'expo-router';

export default function ProfileLayout() {
  return (
    <Stack screenOptions={{
      headerTintColor: '#0a7ea4',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="edit" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="history" options={{ title: 'Riwayat Pesanan' }} />
      <Stack.Screen name="reviews" options={{ title: 'Ulasan' }} />
      <Stack.Screen name="favorites" options={{ title: 'Favorite' }} />
      <Stack.Screen name="settings" options={{ title: 'Settings Application' }} />
    </Stack>
  );
}
