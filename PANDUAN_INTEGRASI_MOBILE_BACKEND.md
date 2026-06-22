# Panduan Integrasi Mobile App (Expo) dengan Backend (Laravel Filament)

## 📋 Daftar Isi
1. [Arsitektur Sistem](#arsitektur-sistem)
2. [Setup Backend (Laravel Filament)](#setup-backend)
3. [Setup Mobile App (Expo)](#setup-mobile-app)
4. [Menghubungkan Keduanya](#menghubungkan-keduanya)
5. [Testing Koneksi](#testing-koneksi)
6. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arsitektur Sistem

```
┌─────────────────────────────────┐
│  Admin Panel (Filament)         │
│  - Manage Products              │
│  - Manage Orders                │
│  - Manage Users                 │
│  - Manage Categories            │
│  - Manage Packages              │
└────────────┬────────────────────┘
             │
             │ MySQL Database
             │
┌────────────▼────────────────────┐
│  Laravel Backend API            │
│  Location: Mobile-And-Backend/  │
│  - REST API Endpoints           │
│  - Authentication (Sanctum)     │
│  - Firebase Integration         │
│  - CBIR (AI Image Search)       │
└────────────┬────────────────────┘
             │
             │ HTTP API Calls
             │ (JSON)
             │
┌────────────▼────────────────────┐
│  Mobile App (Expo)              │
│  Location: My-App/              │
│  - Android & iOS                │
│  - React Native                 │
│  - Frontend UI                  │
└─────────────────────────────────┘
```

---

## 🚀 Setup Backend (Laravel Filament)

### 1. Lokasi Backend
```
d:\Weeding-Organizer-CBIR\Mobile-And-Backend\
```

### 2. Jalankan Laravel Server

**Option A: Local Network (Recommended for Mobile Testing)**
```bash
cd Mobile-And-Backend
php artisan serve --host=0.0.0.0 --port=8000
```

**Option B: Localhost (Hanya untuk testing di browser)**
```bash
cd Mobile-And-Backend
php artisan serve
```

### 3. Cari IP Address Komputer Anda

**Windows:**
```cmd
ipconfig
# Cari IPv4 Address, contoh: 192.168.100.63
```

**Mac/Linux:**
```bash
ifconfig
# atau
ip addr
```

### 4. Test Backend API

Buka browser dan akses:
```
http://YOUR_IP:8000/api/ping
```

Contoh response sukses:
```json
{
  "status": "ok",
  "timestamp": "2024-06-21T10:30:00Z",
  "is_mobile": false,
  "db_status": "connected",
  "user_count": 10
}
```

---

## 📱 Setup Mobile App (Expo)

### 1. Lokasi Mobile App
```
d:\Weeding-Organizer-CBIR\My-App\
```

### 2. Install Dependencies
```bash
cd My-App
npm install
```

### 3. Konfigurasi Environment Variables

Edit file `.env` di folder `My-App`:

```env
# Laravel Backend API
EXPO_PUBLIC_API_URL=http://192.168.100.63:8000/api

# Ganti 192.168.100.63 dengan IP address komputer Anda
# yang didapat dari langkah sebelumnya
```

### 4. Jalankan Expo Development Server
```bash
npm start
```

Atau untuk platform spesifik:
```bash
# Android
npm run android

# iOS
npm run ios
```

---

## 🔗 Menghubungkan Keduanya

### 1. API Service Layer

File API service sudah dibuat di:
```
My-App/src/lib/api.ts
```

Contoh penggunaan di mobile app:

```typescript
import { apiClient } from '@/lib/api';

// Login
const { data } = await apiClient.post('/login', {
  email: 'user@example.com',
  password: 'password'
});

// Get Products
const products = await apiClient.get('/products');

// Get Profile (dengan auth token)
const profile = await apiClient.get('/profile');
```

### 2. Data Flow

```
Admin Panel (Filament)
  ↓
  Tambah/Edit Product di admin panel
  ↓
  Data tersimpan di MySQL Database
  ↓
  API endpoint: GET /api/products
  ↓
  Mobile App fetch data via API
  ↓
  Data ditampilkan di UI mobile
```

### 3. Fitur yang Tersedia

#### Authentication
- ✅ Register: `POST /api/register`
- ✅ Login: `POST /api/login`
- ✅ Logout: `POST /api/logout`
- ✅ OTP Verification: `POST /api/auth/verify-otp`
- ✅ Reset Password: `POST /api/reset-password`

#### Products & Packages
- ✅ List Products: `GET /api/products`
- ✅ Product Detail: `GET /api/products/{id}`
- ✅ List Packages: `GET /api/packages`
- ✅ Package Detail: `GET /api/packages/{id}`

#### Categories
- ✅ List Categories: `GET /api/categories`
- ✅ Categories with Packages: `GET /api/categories-with-packages`

#### Cart & Orders
- ✅ Cart List: `GET /api/cart`
- ✅ Add to Cart: `POST /api/cart/add`
- ✅ Create Order: `POST /api/orders`
- ✅ Order History: `GET /api/orders`

#### Wishlist
- ✅ Wishlist List: `GET /api/wishlist`
- ✅ Toggle Wishlist: `POST /api/wishlist/toggle`

#### Search
- ✅ Text Search: `GET /api/search?q={query}`
- ✅ Image Search (CBIR): `POST /api/search/image`

#### Chat
- ✅ Conversations: `GET /api/messages/conversations`
- ✅ Send Message: `POST /api/messages/send`

#### Reviews
- ✅ Add Review: `POST /api/reviews`
- ✅ Get Reviews: `GET /api/reviews/package/{packageId}`

---

## ✅ Testing Koneksi

### 1. Test dari Browser
```
http://YOUR_IP:8000/api/ping
```

### 2. Test dari Mobile App

Tambahkan kode ini di screen manapun:

```typescript
import { useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function TestScreen() {
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const response = await apiClient.get('/ping');
      console.log('✅ Connection Success:', response.data);
      alert('Connection Success!');
    } catch (error) {
      console.error('❌ Connection Failed:', error);
      alert('Connection Failed!');
    }
  };

  return <Text>Testing Connection...</Text>;
}
```

### 3. Checklist Koneksi Berhasil

- [ ] Laravel server running di `http://YOUR_IP:8000`
- [ ] Browser bisa akses `http://YOUR_IP:8000/api/ping`
- [ ] Mobile device dan komputer di WiFi yang sama
- [ ] File `.env` di My-App sudah diupdate dengan IP yang benar
- [ ] Mobile app bisa fetch data dari API
- [ ] Data yang diinput di admin panel muncul di mobile app

---

## 🐛 Troubleshooting

### Problem 1: "Network Request Failed"

**Penyebab:**
- Mobile device dan server tidak di network yang sama
- IP address salah
- Laravel server tidak running

**Solusi:**
```bash
# 1. Pastikan Laravel running dengan host 0.0.0.0
cd Mobile-And-Backend
php artisan serve --host=0.0.0.0 --port=8000

# 2. Check IP address
ipconfig  # Windows
ifconfig  # Mac/Linux

# 3. Update .env di My-App dengan IP yang benar
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api

# 4. Restart Expo dev server
npm start
```

### Problem 2: "CORS Error"

**Solusi:**

Edit `Mobile-And-Backend/config/cors.php`:
```php
return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_origins' => ['*'],
    'allowed_methods' => ['*'],
    'allowed_headers' => ['*'],
    'supports_credentials' => true,
];
```

### Problem 3: Data Admin Panel Tidak Muncul di Mobile

**Solusi:**

1. **Check di browser** apakah endpoint API mengembalikan data:
   ```
   http://YOUR_IP:8000/api/products
   ```

2. **Check authentication** - beberapa endpoint butuh login:
   ```typescript
   // Login dulu
   await apiClient.post('/login', { email, password });
   
   // Baru bisa akses
   await apiClient.get('/products');
   ```

3. **Check database** - pastikan ada data di tabel:
   ```bash
   php artisan tinker
   >>> \App\Models\Product::count()
   >>> \App\Models\Package::count()
   ```

### Problem 4: Firewall Blocking

**Windows:**
```
1. Buka Windows Defender Firewall
2. Allow app through firewall
3. Allow PHP/Laravel di Private networks
```

**Mac:**
```
System Preferences > Security & Privacy > Firewall Options
Allow incoming connections for PHP
```

---

## 📚 Dokumentasi API Lengkap

### Base URL
```
http://YOUR_IP:8000/api
```

### Authentication Headers
```
Authorization: Bearer {token}
Accept: application/json
Content-Type: application/json
```

### Response Format

**Success:**
```json
{
  "status": "success",
  "data": { ... },
  "message": "Operation successful"
}
```

**Error:**
```json
{
  "status": "error",
  "message": "Error message here",
  "errors": { ... }
}
```

---

## 🎯 Workflow Lengkap

### Contoh: Menambah Product dari Admin dan Tampil di Mobile

#### Step 1: Admin Panel (Filament)
1. Login ke admin panel: `http://localhost:8000/admin`
2. Pergi ke **Products**
3. Click **New Product**
4. Isi form:
   - Name: "Wedding Package Premium"
   - Price: 50000000
   - Description: "Paket pernikahan lengkap"
   - Category: Wedding
   - Upload gambar
5. **Save**

#### Step 2: Verifikasi di API
Browser: `http://YOUR_IP:8000/api/products`

Response:
```json
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Wedding Package Premium",
      "price": 50000000,
      "description": "Paket pernikahan lengkap",
      "image_url": "http://YOUR_IP:8000/storage/products/image.jpg"
    }
  ]
}
```

#### Step 3: Mobile App Fetch Data

```typescript
// src/screens/ProductsScreen.tsx
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get('/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    }
  };

  return (
    <FlatList
      data={products}
      renderItem={({ item }) => (
        <View>
          <Text>{item.name}</Text>
          <Text>Rp {item.price.toLocaleString()}</Text>
          <Image source={{ uri: item.image_url }} />
        </View>
      )}
    />
  );
}
```

#### Step 4: Result
Product yang ditambahkan di admin panel akan muncul di mobile app! 🎉

---

## 🔐 Security Best Practices

1. **Gunakan HTTPS di Production**
   ```
   EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
   ```

2. **Jangan commit .env dengan credentials**
   ```
   # .gitignore
   .env
   .env.local
   ```

3. **Validasi Token di setiap request**
   ```typescript
   // API client otomatis menambahkan token
   apiClient.get('/profile'); // Token included automatically
   ```

4. **Handle Token Expiration**
   ```typescript
   // src/lib/api.ts sudah handle auto logout jika 401
   ```

---

## 📞 Support

Jika ada masalah:

1. Check logs Laravel: `Mobile-And-Backend/storage/logs/laravel.log`
2. Check logs Expo: Terminal output dari `npm start`
3. Check network tab di Expo Dev Tools

---

**Happy Coding! 🚀**
