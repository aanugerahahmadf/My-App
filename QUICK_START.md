# 🚀 Quick Start Guide - Wedding Organizer Mobile App

Panduan cepat untuk menjalankan Wedding Organizer App dengan Admin Panel Filament.

---

## ⚡ Setup Dalam 5 Menit

### 1️⃣ Start Backend (Laravel)

```bash
# Buka terminal/cmd
cd d:\Weeding-Organizer-CBIR\Mobile-And-Backend

# Install dependencies (hanya pertama kali)
composer install

# Copy .env file (jika belum ada)
copy .env.example .env

# Generate app key (jika belum)
php artisan key:generate

# Run migrations (jika belum)
php artisan migrate

# PENTING: Jalankan server dengan host 0.0.0.0
php artisan serve --host=0.0.0.0 --port=8000
```

**✅ Backend Ready!** Server running di: `http://YOUR_IP:8000`

---

### 2️⃣ Cari IP Address Komputer

**Windows:**
```cmd
ipconfig
```
Cari **IPv4 Address**, contoh: `192.168.100.63`

**Mac/Linux:**
```bash
ifconfig
```
atau
```bash
ip addr
```

**💡 Tips:** Pastikan mobile device dan komputer terhubung ke WiFi yang sama!

---

### 3️⃣ Setup Mobile App (Expo)

```bash
# Buka terminal baru (jangan tutup terminal backend)
cd d:\Weeding-Organizer-CBIR\My-App

# Install dependencies (hanya pertama kali)
npm install

# Buat file .env (copy dari .env.example)
copy .env.example .env
```

**Edit file `.env`:**
```env
# Ganti dengan IP address komputer Anda
EXPO_PUBLIC_API_URL=http://192.168.100.63:8000/api

# Contoh: jika IP Anda 192.168.1.100
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8000/api
```

**Start Expo:**
```bash
npm start
```

**✅ Mobile App Ready!**

---

### 4️⃣ Test Koneksi

**Option A: Test di Browser**
```
http://192.168.100.63:8000/api/ping
```

**Option B: Test di Mobile App**

Tambah kode ini di screen manapun:

```typescript
import { useEffect } from 'react';
import { API_SERVICES } from '@/lib/api-services';
import { Alert } from 'react-native';

export default function TestScreen() {
  useEffect(() => {
    testConnection();
  }, []);

  const testConnection = async () => {
    try {
      const result = await API_SERVICES.health.ping();
      Alert.alert('✅ Success', `Connected! Users: ${result.user_count}`);
    } catch (error) {
      Alert.alert('❌ Failed', 'Cannot connect to backend');
    }
  };

  return null;
}
```

---

## 📱 Run Mobile App

### Android

```bash
npm run android
```

### iOS (Mac only)

```bash
npm run ios
```

### Expo Go App

1. Install **Expo Go** dari Play Store / App Store
2. Scan QR code dari terminal
3. App akan terbuka di Expo Go

---

## 🎨 Access Admin Panel

```
http://localhost:8000/admin
```

**Default Login:**
- Email: `admin@admin.com`
- Password: `password`

*(Check di database atau create user baru)*

---

## 📊 Workflow Lengkap

### Menambah Product dari Admin → Muncul di Mobile

#### Step 1: Login ke Admin Panel
```
http://localhost:8000/admin
```

#### Step 2: Tambah Product
1. Klik menu **Products**
2. Klik **New Product**
3. Isi form:
   - Name: "Wedding Decoration Premium"
   - Price: 25000000
   - Description: "Dekorasi pernikahan lengkap"
   - Category: Pilih kategori
   - Upload foto
4. **Save**

#### Step 3: Verifikasi di API
```
http://192.168.100.63:8000/api/products
```

Harus muncul product yang baru ditambahkan.

#### Step 4: Cek di Mobile App

Buka ProductsScreen di mobile app, data akan otomatis muncul!

```typescript
// File: src/screens/ProductsScreen.tsx
import { useEffect, useState } from 'react';
import { API_SERVICES } from '@/lib/api-services';

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const data = await API_SERVICES.product.getAll();
    setProducts(data); // Data dari admin panel!
  };

  // Render products...
}
```

**✨ Magic!** Data yang diinput di admin langsung muncul di mobile app!

---

## 🔥 Fitur yang Tersedia

### ✅ Products
- List products
- Product detail
- Featured products
- Products on sale

### ✅ Packages
- List packages
- Package detail with items
- Featured packages

### ✅ Categories
- List categories
- Categories with packages

### ✅ Cart & Orders
- Add to cart
- Update quantity
- Remove from cart
- Create order
- Order history

### ✅ Wishlist
- Add to wishlist
- Remove from wishlist
- View wishlist

### ✅ Search
- Text search
- Image search (CBIR/AI)
- Visual similarity search

### ✅ Chat
- Chat with organizers
- Send messages
- View conversations

### ✅ Profile
- View profile
- Update profile
- Change avatar
- Change password

### ✅ Reviews
- Add review
- View reviews
- Edit review

---

## 🛠️ Common Issues

### Problem: "Network Request Failed"

**Solution:**
```bash
# 1. Check Laravel is running
# Terminal 1:
cd Mobile-And-Backend
php artisan serve --host=0.0.0.0 --port=8000

# 2. Check IP address is correct in .env
# My-App/.env
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000/api

# 3. Restart Expo
npm start
```

### Problem: "Cannot connect to backend"

**Checklist:**
- [ ] Laravel server running?
- [ ] Mobile & computer on same WiFi?
- [ ] IP address correct in .env?
- [ ] Firewall not blocking port 8000?

**Test:**
```bash
# From mobile browser, open:
http://YOUR_IP:8000/api/ping
```

### Problem: "CORS Error"

**Solution:**

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

### Problem: Data tidak muncul di mobile

**Solution:**

1. **Check API endpoint:**
   ```
   http://YOUR_IP:8000/api/products
   ```

2. **Check auth token** (untuk protected endpoints):
   ```typescript
   // Login first
   await API_SERVICES.auth.login(email, password);
   
   // Then fetch data
   await API_SERVICES.product.getAll();
   ```

3. **Check database has data:**
   ```bash
   php artisan tinker
   >>> \App\Models\Product::count()
   ```

---

## 📚 Next Steps

### 1. Baca Dokumentasi Lengkap

- [PANDUAN_INTEGRASI_MOBILE_BACKEND.md](./PANDUAN_INTEGRASI_MOBILE_BACKEND.md)
- [My-App/CONTOH_PENGGUNAAN_API.md](./My-App/CONTOH_PENGGUNAAN_API.md)

### 2. Explore API Services

File: `My-App/src/lib/api-services.ts`

Semua function sudah siap pakai:
```typescript
import { API_SERVICES } from '@/lib/api-services';

// Products
API_SERVICES.product.getAll()
API_SERVICES.product.getById(id)
API_SERVICES.product.getFeatured()

// Cart
API_SERVICES.cart.addItem(packageId, quantity)
API_SERVICES.cart.getItems()

// Orders
API_SERVICES.order.create({ items, event_date })
API_SERVICES.order.getAll()

// Search
API_SERVICES.search.searchText(query)
API_SERVICES.search.searchImage(imageUri)

// Dan masih banyak lagi...
```

### 3. Customize UI

Edit komponen di:
```
My-App/src/components/
My-App/src/screens/
My-App/src/app/
```

### 4. Add Features

Semua API endpoint sudah ready, tinggal buat UI-nya!

---

## 🎯 Checklist Setup Sukses

- [ ] Backend running di `http://YOUR_IP:8000`
- [ ] Browser bisa akses `http://YOUR_IP:8000/api/ping`
- [ ] Mobile & komputer di WiFi yang sama
- [ ] File `.env` di My-App sudah diupdate dengan IP yang benar
- [ ] Expo development server running (`npm start`)
- [ ] Mobile app bisa connect ke backend (test dengan ping)
- [ ] Data dari admin panel muncul di mobile app

**Jika semua checklist ✅, Anda siap coding! 🎉**

---

## 💡 Tips & Tricks

### 1. Hot Reload

Setiap perubahan di mobile app akan otomatis reload. Tidak perlu restart!

### 2. Debug API Calls

```typescript
// api-client.ts sudah log semua API calls
console.log('API Call:', url);
```

### 3. Use React Query (Recommended)

Untuk data fetching yang lebih baik:

```bash
npm install @tanstack/react-query
```

```typescript
import { useQuery } from '@tanstack/react-query';
import { API_SERVICES } from '@/lib/api-services';

function ProductsScreen() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: () => API_SERVICES.product.getAll(),
  });

  // Auto caching, refetch, etc!
}
```

### 4. Environment Variables

Gunakan `.env` untuk config yang berbeda:

```env
# Development
EXPO_PUBLIC_API_URL=http://192.168.100.63:8000/api

# Production
# EXPO_PUBLIC_API_URL=https://api.yourapp.com/api
```

---

## 📞 Need Help?

### Logs Location

**Backend Logs:**
```
Mobile-And-Backend/storage/logs/laravel.log
```

**Mobile Logs:**
- Check terminal output
- Use `console.log()` untuk debug
- Check React Native Debugger

### Test Endpoints

**Health Check:**
```
GET /api/ping
```

**Test Auth:**
```bash
# Login
POST /api/login
{
  "email": "user@example.com",
  "password": "password"
}

# Get profile
GET /api/profile
Headers: Authorization: Bearer {token}
```

---

## 🎓 Learning Resources

1. **Laravel Documentation:** https://laravel.com/docs
2. **Filament Documentation:** https://filamentphp.com/docs
3. **React Native Documentation:** https://reactnative.dev/docs
4. **Expo Documentation:** https://docs.expo.dev/

---

**🎉 Happy Coding!**

Jika ada pertanyaan, cek dokumentasi lengkap atau debug dengan console.log() untuk melihat response dari API.
