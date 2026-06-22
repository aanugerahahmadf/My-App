# Contoh Penggunaan API Services

Dokumentasi lengkap cara menggunakan API Services di mobile app untuk menampilkan data dari admin panel Filament.

---

## 📋 Table of Contents

1. [Setup Awal](#setup-awal)
2. [Menampilkan Products](#menampilkan-products)
3. [Menampilkan Packages](#menampilkan-packages)
4. [Cart & Orders](#cart--orders)
5. [Search & CBIR](#search--cbir)
6. [Chat](#chat)
7. [Profile Management](#profile-management)
8. [Error Handling](#error-handling)

---

## 🚀 Setup Awal

### 1. Import Services

```typescript
// Import service yang dibutuhkan
import { API_SERVICES } from '@/lib/api-services';

// Atau import spesifik
import { ProductService, PackageService } from '@/lib/api-services';
```

### 2. Test Koneksi

```typescript
import { useEffect } from 'react';
import { Alert } from 'react-native';
import { API_SERVICES } from '@/lib/api-services';

export default function TestConnection() {
  useEffect(() => {
    checkConnection();
  }, []);

  const checkConnection = async () => {
    try {
      const result = await API_SERVICES.health.ping();
      console.log('✅ Connection Success:', result);
      Alert.alert('Success', `Connected! DB Status: ${result.db_status}`);
    } catch (error) {
      console.error('❌ Connection Failed:', error);
      Alert.alert('Error', 'Failed to connect to backend');
    }
  };

  return null;
}
```

---

## 🛍️ Menampilkan Products

### Basic Product List

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, StyleSheet } from 'react-native';
import { API_SERVICES, Product } from '@/lib/api-services';

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch products dari API
      const data = await API_SERVICES.product.getAll();
      setProducts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading products...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={products}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.productCard}>
          <Image 
            source={{ uri: item.image_url }} 
            style={styles.image}
          />
          <View style={styles.productInfo}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.description} numberOfLines={2}>
              {item.description}
            </Text>
            <Text style={styles.price}>
              Rp {item.price.toLocaleString('id-ID')}
            </Text>
            {item.on_sale && item.discount_percent && (
              <Text style={styles.discount}>
                {item.discount_percent}% OFF
              </Text>
            )}
          </View>
        </View>
      )}
      contentContainerStyle={styles.list}
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 16,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#E91E63',
  },
  discount: {
    fontSize: 14,
    color: '#4CAF50',
    marginTop: 4,
  },
  error: {
    color: 'red',
    fontSize: 16,
  },
});
```

### Product Detail Screen

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_SERVICES, Product } from '@/lib/api-services';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductDetail();
  }, [id]);

  const loadProductDetail = async () => {
    try {
      const data = await API_SERVICES.product.getById(Number(id));
      setProduct(data);
    } catch (error) {
      console.error('Error loading product:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !product) {
    return <Text>Loading...</Text>;
  }

  return (
    <ScrollView>
      <Image source={{ uri: product.image_url }} style={{ height: 300 }} />
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>
          {product.name}
        </Text>
        <Text style={{ fontSize: 20, color: '#E91E63', marginTop: 8 }}>
          Rp {product.price.toLocaleString('id-ID')}
        </Text>
        <Text style={{ marginTop: 16, lineHeight: 24 }}>
          {product.description}
        </Text>
        <Text style={{ marginTop: 16 }}>
          Stock: {product.stock}
        </Text>
      </View>
    </ScrollView>
  );
}
```

### Featured Products

```typescript
const loadFeaturedProducts = async () => {
  try {
    const featured = await API_SERVICES.product.getFeatured();
    setFeaturedProducts(featured);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Products On Sale

```typescript
const loadSaleProducts = async () => {
  try {
    const onSale = await API_SERVICES.product.getOnSale();
    setSaleProducts(onSale);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 📦 Menampilkan Packages

### Package List dengan Reviews

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { API_SERVICES, Package } from '@/lib/api-services';

export default function PackagesScreen() {
  const [packages, setPackages] = useState<Package[]>([]);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const data = await API_SERVICES.package.getAll();
      setPackages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FlatList
      data={packages}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <PackageCard package={item} />
      )}
    />
  );
}

// Package Card Component
function PackageCard({ package: pkg }: { package: Package }) {
  return (
    <View style={{ padding: 16, backgroundColor: 'white', margin: 8 }}>
      <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{pkg.name}</Text>
      <Text style={{ fontSize: 16, color: '#E91E63', marginTop: 4 }}>
        Rp {pkg.price.toLocaleString('id-ID')}
      </Text>
      
      {/* Package Items */}
      <View style={{ marginTop: 12 }}>
        <Text style={{ fontWeight: 'bold' }}>Includes:</Text>
        {pkg.items?.map((item) => (
          <Text key={item.id} style={{ marginLeft: 8, marginTop: 4 }}>
            • {item.quantity}x {item.product.name}
          </Text>
        ))}
      </View>
    </View>
  );
}
```

---

## 🛒 Cart & Orders

### Add to Cart

```typescript
import { API_SERVICES } from '@/lib/api-services';
import { Alert } from 'react-native';

const addToCart = async (packageId: number) => {
  try {
    await API_SERVICES.cart.addItem(packageId, 1);
    Alert.alert('Success', 'Added to cart!');
  } catch (error) {
    Alert.alert('Error', 'Failed to add to cart');
  }
};
```

### Cart Screen

```typescript
import React, { useEffect, useState } from 'react';
import { View, FlatList, Text, TouchableOpacity } from 'react-native';
import { API_SERVICES, CartItem } from '@/lib/api-services';

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const items = await API_SERVICES.cart.getItems();
      setCartItems(items);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateQuantity = async (cartId: number, newQuantity: number) => {
    try {
      await API_SERVICES.cart.updateQuantity(cartId, newQuantity);
      loadCart(); // Reload cart
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeItem = async (cartId: number) => {
    try {
      await API_SERVICES.cart.removeItem(cartId);
      loadCart(); // Reload cart
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const totalAmount = cartItems.reduce(
    (sum, item) => sum + item.package.price * item.quantity,
    0
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={{ padding: 16, borderBottomWidth: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold' }}>
              {item.package.name}
            </Text>
            <Text style={{ fontSize: 14, color: '#E91E63', marginTop: 4 }}>
              Rp {item.package.price.toLocaleString('id-ID')}
            </Text>
            
            {/* Quantity Controls */}
            <View style={{ flexDirection: 'row', marginTop: 8, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity - 1)}
                disabled={item.quantity <= 1}
                style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}
              >
                <Text>-</Text>
              </TouchableOpacity>
              
              <Text style={{ marginHorizontal: 16 }}>{item.quantity}</Text>
              
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, item.quantity + 1)}
                style={{ padding: 8, backgroundColor: '#f0f0f0', borderRadius: 4 }}
              >
                <Text>+</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => removeItem(item.id)}
                style={{ marginLeft: 'auto', padding: 8 }}
              >
                <Text style={{ color: 'red' }}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
      
      {/* Total */}
      <View style={{ padding: 16, borderTopWidth: 1 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>
          Total: Rp {totalAmount.toLocaleString('id-ID')}
        </Text>
        <TouchableOpacity
          style={{ 
            backgroundColor: '#E91E63', 
            padding: 16, 
            borderRadius: 8,
            marginTop: 16,
          }}
          onPress={createOrder}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: 'bold' }}>
            Checkout
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

### Create Order

```typescript
const createOrder = async () => {
  try {
    // Convert cart items to order items
    const items = cartItems.map(item => ({
      package_id: item.package_id,
      quantity: item.quantity,
    }));

    const order = await API_SERVICES.order.create({
      items,
      event_date: '2024-12-31', // Wedding date
      notes: 'Special requirements...',
    });

    Alert.alert('Success', 'Order created!');
    // Navigate to order detail or payment
  } catch (error) {
    Alert.alert('Error', 'Failed to create order');
  }
};
```

### Order History

```typescript
const loadOrders = async () => {
  try {
    const orders = await API_SERVICES.order.getAll();
    setOrders(orders);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 🔍 Search & CBIR

### Text Search

```typescript
import { API_SERVICES } from '@/lib/api-services';
import { useState } from 'react';

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ packages: [], products: [] });

  const handleSearch = async () => {
    try {
      const data = await API_SERVICES.search.searchText(query);
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Search..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={handleSearch}
      />
      {/* Display results */}
    </View>
  );
}
```

### Image Search (CBIR)

```typescript
import * as ImagePicker from 'expo-image-picker';
import { API_SERVICES } from '@/lib/api-services';

export default function ImageSearchScreen() {
  const [results, setResults] = useState([]);

  const pickImageAndSearch = async () => {
    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        // Search by image
        const packages = await API_SERVICES.search.searchImage(
          result.assets[0].uri
        );
        setResults(packages);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  const takePhotoAndSearch = async () => {
    // Request camera permission
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) return;

    // Take photo
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        const packages = await API_SERVICES.search.searchSimilar(
          result.assets[0].uri,
          'combined' // Method: color, deep, combined, etc
        );
        setResults(packages);
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <View>
      <Button title="Pick from Gallery" onPress={pickImageAndSearch} />
      <Button title="Take Photo" onPress={takePhotoAndSearch} />
      {/* Display results */}
    </View>
  );
}
```

---

## 💬 Chat

### Chat List

```typescript
import { API_SERVICES, Conversation } from '@/lib/api-services';

export default function ChatListScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const data = await API_SERVICES.chat.getConversations();
      setConversations(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <FlatList
      data={conversations}
      renderItem={({ item }) => (
        <TouchableOpacity 
          onPress={() => router.push(`/chat/${item.id}`)}
          style={{ padding: 16, borderBottomWidth: 1 }}
        >
          <Text style={{ fontWeight: 'bold' }}>
            {item.organizer.name}
          </Text>
          <Text numberOfLines={1} style={{ color: '#666', marginTop: 4 }}>
            {item.last_message}
          </Text>
          {item.unread_count > 0 && (
            <View style={{ 
              position: 'absolute', 
              right: 16, 
              top: 16,
              backgroundColor: '#E91E63',
              borderRadius: 12,
              width: 24,
              height: 24,
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Text style={{ color: 'white', fontSize: 12 }}>
                {item.unread_count}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}
```

### Chat Detail

```typescript
export default function ChatDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');

  useEffect(() => {
    loadMessages();
  }, [id]);

  const loadMessages = async () => {
    try {
      const data = await API_SERVICES.chat.getMessages(Number(id));
      setMessages(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    
    try {
      await API_SERVICES.chat.sendMessage(Number(id), newMessage);
      setNewMessage('');
      loadMessages(); // Reload messages
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <View style={{
            padding: 12,
            margin: 8,
            backgroundColor: item.is_mine ? '#E91E63' : '#f0f0f0',
            borderRadius: 12,
            alignSelf: item.is_mine ? 'flex-end' : 'flex-start',
            maxWidth: '80%',
          }}>
            <Text style={{ color: item.is_mine ? 'white' : 'black' }}>
              {item.message}
            </Text>
          </View>
        )}
      />
      
      <View style={{ flexDirection: 'row', padding: 16, borderTopWidth: 1 }}>
        <TextInput
          style={{ flex: 1, borderWidth: 1, borderRadius: 20, padding: 12 }}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity 
          onPress={sendMessage}
          style={{ marginLeft: 8, padding: 12 }}
        >
          <Text style={{ color: '#E91E63', fontWeight: 'bold' }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
```

---

## 👤 Profile Management

### View Profile

```typescript
const loadProfile = async () => {
  try {
    const profile = await API_SERVICES.profile.get();
    setProfile(profile);
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### Update Profile

```typescript
const updateProfile = async () => {
  try {
    const updated = await API_SERVICES.profile.update({
      name: 'New Name',
      phone: '08123456789',
    });
    Alert.alert('Success', 'Profile updated!');
  } catch (error) {
    Alert.alert('Error', 'Failed to update profile');
  }
};
```

### Update Avatar

```typescript
import * as ImagePicker from 'expo-image-picker';

const updateAvatar = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    quality: 0.8,
  });

  if (!result.canceled) {
    try {
      await API_SERVICES.profile.updateAvatar(result.assets[0].uri);
      Alert.alert('Success', 'Avatar updated!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update avatar');
    }
  }
};
```

---

## ⚠️ Error Handling

### Global Error Handler

```typescript
import { Alert } from 'react-native';

export const handleApiError = (error: any) => {
  console.error('API Error:', error);
  
  if (error.message.includes('401')) {
    // Unauthorized - redirect to login
    Alert.alert('Session Expired', 'Please login again');
    // router.push('/login');
  } else if (error.message.includes('Network')) {
    Alert.alert('Network Error', 'Please check your connection');
  } else {
    Alert.alert('Error', error.message || 'Something went wrong');
  }
};
```

### Usage

```typescript
const loadData = async () => {
  try {
    const data = await API_SERVICES.product.getAll();
    setProducts(data);
  } catch (error) {
    handleApiError(error);
  }
};
```

---

## 🎯 Best Practices

### 1. Loading States

```typescript
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);

const loadData = async () => {
  setLoading(true);
  try {
    const result = await API_SERVICES.product.getAll();
    setData(result);
  } catch (error) {
    handleApiError(error);
  } finally {
    setLoading(false);
  }
};
```

### 2. Pull to Refresh

```typescript
const [refreshing, setRefreshing] = useState(false);

const onRefresh = async () => {
  setRefreshing(true);
  await loadData();
  setRefreshing(false);
};

return (
  <FlatList
    data={data}
    refreshing={refreshing}
    onRefresh={onRefresh}
    // ...
  />
);
```

### 3. Pagination

```typescript
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);

const loadMore = async () => {
  if (!hasMore) return;
  
  try {
    const newData = await apiGet(`${API.PRODUCTS.ALL}?page=${page + 1}`);
    if (newData.data.length === 0) {
      setHasMore(false);
    } else {
      setProducts([...products, ...newData.data]);
      setPage(page + 1);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

**Happy Coding! 🚀**
