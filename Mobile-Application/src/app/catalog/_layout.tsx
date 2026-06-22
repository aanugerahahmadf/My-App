import { Stack } from 'expo-router';

export default function CatalogLayout() {
  return (
    <Stack screenOptions={{
      headerTintColor: '#0a7ea4',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
      <Stack.Screen name="packages" options={{ title: 'Katalog Paket Bunga' }} />
      <Stack.Screen name="flowers" options={{ title: 'Katalog Bunga' }} />
    </Stack>
  );
}
