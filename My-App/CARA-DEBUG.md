# 🔥 CARA FIX: Data & Gambar Tidak Muncul di Aplikasi Mobile

## 🎯 MASALAH ANDA

Anda sudah:

- ✅ Jalankan `php artisan serve --host=0.0.0.0 --port=8000`
- ✅ Input data (nama, gambar, dll) via Filament Admin Panel
- ❌ **TAPI data & gambar tidak muncul di aplikasi Android/iOS**

---

## 🚨 5 PENYEBAB UTAMA & SOLUSINYA

### 1. Storage Link Belum Dibuat ⚠️

**INI PALING SERING JADI MASALAH!**

Gambar yang di-upload via Filament tersimpan di `storage/app/public/`, tapi Laravel tidak bisa serve file dari folder ini tanpa membuat symbolic link.

**SOLUSI:**

```bash
# Di folder Laravel project
php artisan storage:link
```

Output yang benar:

```
The [public/storage] link has been connected to [storage/app/public].
```

**Verifikasi:**

- Buka `http://192.168.100.63:8000/storage`
- Harus bisa lihat folder gambar
- Jika error 404, link belum dibuat

---

### 2. Image URL Tidak Full Path ⚠️

Kadang image_url di database cuma berisi path relatif seperti:

```
products/bunga.jpg  ❌ SALAH
```

Seharusnya full URL:

```
http://192.168.100.63:8000/storage/products/bunga.jpg  ✅ BENAR
```

**SOLUSI:**

Tambahkan accessor di Model Laravel:

**File: `app/Models/Product.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Product extends Model
{
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        // Jika field 'image' berisi path
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }
}
```

**File: `app/Models/Package.php`**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Package extends Model
{
    protected $appends = ['image_url'];

    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }
}
```

---

### 3. CORS Tidak Dikonfigurasi ⚠️

Mobile app tidak bisa fetch data jika CORS tidak diizinkan.

**SOLUSI:**

**File: `config/cors.php`**

```php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie', 'storage/*'],

    'allowed_methods' => ['*'],

    'allowed_origins' => ['*'],  // Untuk development

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
```

Kemudian:

```bash
php artisan config:clear
php artisan cache:clear
```

---

### 4. Data Belum Benar-Benar Masuk Database ⚠️

Kadang setelah input via Filament, data tidak tersimpan karena error validation atau relationship.

**VERIFIKASI:**

```bash
# Buka tinker
php artisan tinker
```

```php
// Di dalam tinker
\App\Models\Product::count()  // Cek jumlah
\App\Models\Product::first()  // Lihat data pertama
\App\Models\Package::count()
\App\Models\Package::first()
```

Jika kosong (0), maka data belum masuk!

**SOLUSI:**

- Cek error logs: `storage/logs/laravel.log`
- Atau jalankan seeder:
  ```bash
  php artisan db:seed --class=ProductSeeder
  php artisan db:seed --class=PackageSeeder
  ```

---

### 5. Network/Firewall Masalah ⚠️

Mobile device tidak bisa reach Laravel server.

**CEK:**

1. **Mobile dan server HARUS di WiFi yang sama!**

2. **Test di browser mobile dulu:**
   - Buka browser di HP
   - Akses: `http://192.168.100.63:8000/api/products/public`
   - Jika gagal → masalah network
   - Jika berhasil → masalah di React Native

3. **Matikan firewall sementara untuk test:**

   ```
   Windows: Control Panel > Firewall > Turn off
   ```

4. **Pastikan IP benar:**

   ```cmd
   # Di Windows
   ipconfig

   # Cari IPv4 Address
   ```

---

## 🧪 CARA TEST STEP-BY-STEP

### Step 1: Test Laravel API (Browser Desktop)

Buka browser di komputer, akses:

```
http://192.168.100.63:8000/api/products/public
```

**Hasil yang benar:**

```json
{
  "data": [
    {
      "id": 1,
      "name": "Rose Bouquet",
      "price": 150000,
      "image_url": "http://192.168.100.63:8000/storage/products/bunga.jpg"
    }
  ]
}
```

- ✅ Jika berhasil → Lanjut Step 2
- ❌ Jika gagal → Fix Laravel dulu (database/model/controller)

---

### Step 2: Test Image URL (Browser Desktop)

Copy salah satu `image_url` dari response, paste di browser:

```
http://192.168.100.63:8000/storage/products/bunga.jpg
```

- ✅ Jika muncul gambar → Lanjut Step 3
- ❌ Jika 404 → Jalankan `php artisan storage:link`

---

### Step 3: Test dari HP (Browser Mobile)

Buka browser **di HP**, akses URL yang sama:

```
http://192.168.100.63:8000/api/products/public
```

- ✅ Jika berhasil → Lanjut Step 4
- ❌ Jika gagal → Masalah network/firewall

---

### Step 4: Test Image dari HP (Browser Mobile)

Akses image URL dari browser HP:

```
http://192.168.100.63:8000/storage/products/bunga.jpg
```

- ✅ Jika muncul gambar → Lanjut Step 5
- ❌ Jika gagal → Masalah CORS atau storage link

---

### Step 5: Jalankan Script Debug

Di folder `My-App`:

```bash
node debug-api.js
```

Script ini akan test semua endpoint otomatis dan kasih report.

---

### Step 6: Test di Aplikasi Mobile

```bash
# Clear cache dulu
npx expo start --clear
```

Kemudian buka aplikasi di HP.

- ✅ Jika muncul → **SELESAI!** 🎉
- ❌ Jika belum → Lihat logs di Metro bundler

---

## 🛠️ QUICK FIX COMMAND (JALANKAN SEMUA INI)

**Di Laravel Project:**

```bash
# Clear semua cache
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Buat storage link
php artisan storage:link

# (Optional) Reseed data jika database kosong
php artisan db:seed

# Start server
php artisan serve --host=0.0.0.0 --port=8000
```

**Di React Native Project:**

```bash
# Clear cache
npx expo start --clear

# Test API
node debug-api.js
```

---

## 📸 CARA CEK GAMBAR SUDAH TERSIMPAN

### Via File Explorer:

```
Laravel-Project/
  └── storage/
      └── app/
          └── public/
              ├── products/    ← Harus ada folder ini
              │   └── bunga.jpg
              └── packages/    ← Harus ada folder ini
                  └── paket.jpg
```

### Via Browser:

```
http://192.168.100.63:8000/storage/products/bunga.jpg
```

Harus muncul gambar!

---

## 🔍 CARA DEBUG DI FILAMENT

1. Login ke Filament: `http://192.168.100.63:8000/admin`
2. Buka **Products**
3. Klik salah satu product
4. Pastikan:
   - ✅ Ada preview gambar
   - ✅ Field `image` terisi (misalnya: `products/abc123.jpg`)
   - ✅ Status Active = YES

---

## 💡 TIPS PRO

### Cara Lihat Response API dari Mobile App:

Tambahkan log di `apiGet` function:

**File: `src/lib/api-client.ts`**

```typescript
export async function apiGet<T = any>(url: string): Promise<T> {
  console.log("🌐 API GET:", url); // ← Tambahkan ini
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  const json = await res.json();
  console.log("✅ Response:", JSON.stringify(json).substring(0, 200)); // ← Dan ini
  return json;
}
```

Kemudian lihat logs di Metro bundler terminal.

---

## 🎯 CHECKLIST SEBELUM BILANG "SUDAH BENAR"

Pastikan SEMUA ini ✅:

- [ ] Laravel server running di `0.0.0.0:8000`
- [ ] `php artisan storage:link` sudah dijalankan
- [ ] Folder `public/storage` ada (symlink ke `storage/app/public`)
- [ ] Database berisi data (cek via tinker atau Filament)
- [ ] Gambar ter-upload dan tersimpan di `storage/app/public/products/`
- [ ] Browser desktop bisa akses `http://192.168.100.63:8000/api/products/public`
- [ ] Browser desktop bisa buka gambar langsung
- [ ] Browser mobile (HP) bisa akses URL yang sama
- [ ] Browser mobile bisa buka gambar langsung
- [ ] `node debug-api.js` passed semua tests
- [ ] `.env` di mobile app berisi `EXPO_PUBLIC_API_URL=http://192.168.100.63:8000/api`
- [ ] Mobile dan server di WiFi yang sama

**Jika SEMUA ✅, aplikasi PASTI akan menampilkan data dengan gambar!**

---

## 🆘 JIKA MASIH GAGAL

Screenshot & Share:

1. Output `node debug-api.js`
2. Response dari browser saat akses `http://192.168.100.63:8000/api/products/public`
3. Screenshot Filament admin panel (Products page)
4. Logs dari Metro bundler
5. Output `php artisan tinker` → `Product::first()`

---

**Good luck! 🚀**
