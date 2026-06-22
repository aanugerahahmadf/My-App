# 🏗️ Architecture Diagram - Wedding Organizer System

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    WEDDING ORGANIZER SYSTEM                      │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────────┐      ┌──────────────────────┐
│   Admin Panel Web    │      │   Mobile App         │
│   (Filament)         │      │   (Expo/React Native)│
│                      │      │                      │
│  - Manage Products   │      │  - Browse Products   │
│  - Manage Orders     │      │  - Place Orders      │
│  - Manage Users      │      │  - Chat              │
│  - Manage Categories │      │  - Search (AI)       │
│  - View Analytics    │      │  - Profile           │
└──────────┬───────────┘      └──────────┬───────────┘
           │                             │
           │                             │
           └─────────────┬───────────────┘
                         │
                         ▼
          ┌──────────────────────────────┐
          │  Laravel Backend API         │
          │  (REST API)                  │
          │                              │
          │  Port: 8000                  │
          │  Base: /api                  │
          └──────────────┬───────────────┘
                         │
                         │
          ┌──────────────┴───────────────┐
          │                              │
          ▼                              ▼
┌─────────────────┐          ┌─────────────────────┐
│  MySQL Database │          │  Firebase Realtime  │
│                 │          │  (Optional)         │
│  - users        │          │                     │
│  - products     │          │  - messages         │
│  - packages     │          │  - notifications    │
│  - orders       │          │                     │
│  - categories   │          └─────────────────────┘
└─────────────────┘
```


## Data Flow - Admin Panel to Mobile App

```
STEP 1: Admin Input
┌─────────────────────────────────┐
│  Admin Panel (Filament)         │
│  http://localhost:8000/admin    │
│                                 │
│  Admin menambahkan:             │
│  - Product: "Wedding Deco"      │
│  - Price: Rp 25.000.000         │
│  - Image: wedding.jpg           │
│  - Category: Decoration         │
└────────────┬────────────────────┘
             │
             │ [SAVE]
             ▼
┌─────────────────────────────────┐
│  MySQL Database                 │
│  Table: products                │
│                                 │
│  INSERT INTO products           │
│  (name, price, image, ...)      │
└────────────┬────────────────────┘
             │
             │ [STORED]
             ▼

STEP 2: API Endpoint Ready
┌─────────────────────────────────┐
│  Laravel API                    │
│  GET /api/products              │
│                                 │
│  Response:                      │
│  {                              │
│    "data": [                    │
│      {                          │
│        "id": 1,                 │
│        "name": "Wedding Deco",  │
│        "price": 25000000,       │
│        "image_url": "..."       │
│      }                          │
│    ]                            │
│  }                              │
└────────────┬────────────────────┘
             │
             │ [HTTP REQUEST]
             ▼

STEP 3: Mobile App Fetch
┌─────────────────────────────────┐
│  Mobile App (React Native)      │
│                                 │
│  const data = await             │
│    API_SERVICES.product.getAll()│
│                                 │
│  setProducts(data)              │
└────────────┬────────────────────┘
             │
             │ [RENDER]
             ▼

STEP 4: Display to User
┌─────────────────────────────────┐
│  📱 User's Phone Screen         │
│                                 │
│  ┌───────────────────────────┐  │
│  │ 🏠 Wedding Deco          │  │
│  │ 💰 Rp 25.000.000         │  │
│  │ [Add to Cart]            │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘

✅ Data dari admin panel berhasil tampil di mobile!
```


## API Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Mobile App Layer                       │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │ Components   │  │   Screens    │  │    Hooks     │  │
│  │ (UI)         │  │  (Pages)     │  │  (Logic)     │  │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  │
│         │                 │                  │          │
│         └─────────────────┼──────────────────┘          │
│                           │                             │
│                           ▼                             │
│              ┌────────────────────────┐                 │
│              │   API Services Layer   │                 │
│              │  api-services.ts       │                 │
│              │                        │                 │
│              │  - ProductService      │                 │
│              │  - PackageService      │                 │
│              │  - CartService         │                 │
│              │  - OrderService        │                 │
│              └────────────┬───────────┘                 │
│                           │                             │
│                           ▼                             │
│              ┌────────────────────────┐                 │
│              │   API Client Layer     │                 │
│              │  api-client.ts         │                 │
│              │                        │                 │
│              │  - apiGet()            │                 │
│              │  - apiPost()           │                 │
│              │  - apiPut()            │                 │
│              │  - apiDelete()         │                 │
│              │  - Token Management    │                 │
│              └────────────┬───────────┘                 │
│                           │                             │
└───────────────────────────┼─────────────────────────────┘
                            │
                            │ HTTP/JSON
                            │
┌───────────────────────────▼─────────────────────────────┐
│                  Laravel Backend                         │
│                                                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │              API Routes                          │    │
│  │         routes/api.php                           │    │
│  │                                                  │    │
│  │  GET  /api/products                             │    │
│  │  POST /api/cart/add                             │    │
│  │  POST /api/orders                               │    │
│  │  ...                                            │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
│                       ▼                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │           Controllers                            │    │
│  │     app/Http/Controllers/Api/                    │    │
│  │                                                  │    │
│  │  - ProductController                            │    │
│  │  - CartController                               │    │
│  │  - OrderController                              │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
│                       ▼                                  │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Models                              │    │
│  │         app/Models/                              │    │
│  │                                                  │    │
│  │  - Product                                      │    │
│  │  - Package                                      │    │
│  │  - Order                                        │    │
│  └────────────────────┬────────────────────────────┘    │
│                       │                                  │
└───────────────────────┼──────────────────────────────────┘
                        │
                        ▼
            ┌───────────────────────┐
            │   MySQL Database      │
            │                       │
            │  - products           │
            │  - packages           │
            │  - orders             │
            │  - users              │
            └───────────────────────┘
```


## Network Communication

```
┌──────────────────────────────────────────────────────────┐
│  Mobile Device (Phone/Tablet)                            │
│  IP: 192.168.1.50                                        │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Expo App                                       │     │
│  │  EXPO_PUBLIC_API_URL=http://192.168.1.100:8000│     │
│  └────────────────────────────────────────────────┘     │
└───────────────────────┬──────────────────────────────────┘
                        │
                        │ WiFi Network
                        │ (Same Network Required)
                        │
                        │ HTTP Request:
                        │ GET /api/products
                        │ Authorization: Bearer {token}
                        │
┌───────────────────────▼──────────────────────────────────┐
│  Development Computer                                     │
│  IP: 192.168.1.100                                       │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  Laravel Server                                 │     │
│  │  php artisan serve --host=0.0.0.0 --port=8000 │     │
│  │                                                 │     │
│  │  Listening on: 0.0.0.0:8000                   │     │
│  │  Accessible from: 192.168.1.100:8000          │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  MySQL Database                                 │     │
│  │  Port: 3306                                     │     │
│  └────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────┘

Response Flow:
═══════════════

1. Mobile App sends: GET http://192.168.1.100:8000/api/products
2. Laravel receives request
3. Laravel queries MySQL database
4. MySQL returns data
5. Laravel formats as JSON
6. Laravel sends response to mobile
7. Mobile App displays data to user

Time: ~100-500ms (local network)
```


## Authentication Flow

```
┌────────────────────────────────────────────────────────┐
│              LOGIN PROCESS                              │
└────────────────────────────────────────────────────────┘

STEP 1: User Login
┌──────────────────┐
│  Mobile App      │
│                  │
│  User enters:    │
│  - Email         │
│  - Password      │
│                  │
│  [Login Button]  │
└────────┬─────────┘
         │
         │ POST /api/login
         │ { email, password }
         ▼
┌──────────────────┐
│  Laravel API     │
│                  │
│  1. Validate     │
│  2. Check DB     │
│  3. Generate     │
│     Token        │
└────────┬─────────┘
         │
         │ Response:
         │ {
         │   "token": "abc123...",
         │   "user": {...}
         │ }
         ▼
┌──────────────────┐
│  Mobile App      │
│                  │
│  Store token in  │
│  SecureStore     │
│                  │
│  ✅ Logged In    │
└──────────────────┘


STEP 2: Authenticated Requests
┌──────────────────┐
│  Mobile App      │
│                  │
│  Need data?      │
│  Get products    │
└────────┬─────────┘
         │
         │ GET /api/products
         │ Headers:
         │   Authorization: Bearer abc123...
         ▼
┌──────────────────┐
│  Laravel API     │
│                  │
│  Verify token    │
│  Get user        │
│  Return data     │
└────────┬─────────┘
         │
         │ Response:
         │ { data: [...] }
         ▼
┌──────────────────┐
│  Mobile App      │
│                  │
│  Display data    │
└──────────────────┘


STEP 3: Logout
┌──────────────────┐
│  Mobile App      │
│  [Logout]        │
└────────┬─────────┘
         │
         │ POST /api/logout
         │ Authorization: Bearer abc123...
         ▼
┌──────────────────┐
│  Laravel API     │
│  Revoke token    │
└────────┬─────────┘
         │
         │ Success
         ▼
┌──────────────────┐
│  Mobile App      │
│  Clear token     │
│  → Login Screen  │
└──────────────────┘
```


## Database Schema (Simplified)

```sql
┌─────────────────────────────────────────────────────────┐
│                    DATABASE TABLES                       │
└─────────────────────────────────────────────────────────┘

users
├── id
├── name
├── email
├── password
├── phone
├── avatar_url
└── created_at

categories
├── id
├── name
├── description
├── icon
└── created_at

products
├── id
├── name
├── description
├── price
├── image_url
├── category_id  ──────┐
├── stock               │
├── is_featured         │
├── on_sale            │
└── discount_percent   │
                        │
packages                │
├── id                  │
├── name                │
├── description         │
├── price               │
├── image_url           │
├── category_id  ──────┤
├── is_featured         │
└── on_sale            │
                        │
package_items           │
├── id                  │
├── package_id          │
├── product_id  ───────┤
├── quantity            │
└── created_at         │
                        │
cart                    │
├── id                  │
├── user_id  ──────────┤
├── package_id         │
├── quantity            │
└── created_at         │
                        │
orders                  │
├── id                  │
├── user_id  ──────────┤
├── order_number        │
├── status              │
├── total_amount        │
├── payment_status      │
├── event_date          │
└── created_at         │
                        │
order_items            │
├── id                  │
├── order_id  ─────────┤
├── package_id         │
├── quantity            │
├── price               │
└── created_at         │
                        │
wishlist               │
├── id                  │
├── user_id  ──────────┤
├── package_id  ───────┘
└── created_at

reviews
├── id
├── package_id
├── user_id
├── rating
├── comment
└── created_at

Relationships:
──────────────
• products → categories (many-to-one)
• packages → categories (many-to-one)
• package_items → packages (many-to-one)
• package_items → products (many-to-one)
• cart → users (many-to-one)
• cart → packages (many-to-one)
• orders → users (many-to-one)
• order_items → orders (many-to-one)
• wishlist → users (many-to-one)
• reviews → packages (many-to-one)
```


## File Structure

```
Weeding-Organizer-CBIR/
│
├── Mobile-And-Backend/          # Laravel Backend + Filament Admin
│   ├── app/
│   │   ├── Filament/           # Admin Panel (Filament)
│   │   │   ├── Resources/
│   │   │   │   ├── ProductResource.php
│   │   │   │   ├── PackageResource.php
│   │   │   │   ├── OrderResource.php
│   │   │   │   └── ...
│   │   │   └── Pages/
│   │   │
│   │   ├── Http/
│   │   │   └── Controllers/
│   │   │       └── Api/        # API Controllers
│   │   │           ├── ProductController.php
│   │   │           ├── PackageController.php
│   │   │           ├── CartController.php
│   │   │           ├── OrderController.php
│   │   │           └── ...
│   │   │
│   │   └── Models/              # Database Models
│   │       ├── Product.php
│   │       ├── Package.php
│   │       ├── Order.php
│   │       └── ...
│   │
│   ├── routes/
│   │   ├── api.php             # ⭐ API Routes (semua endpoint)
│   │   └── web.php
│   │
│   ├── database/
│   │   └── migrations/         # Database schema
│   │
│   └── .env                    # Backend config
│
├── My-App/                      # Mobile App (Expo/React Native)
│   ├── src/
│   │   ├── app/                # Expo Router screens
│   │   │   ├── (tabs)/
│   │   │   │   ├── index.tsx   # Home
│   │   │   │   ├── products.tsx
│   │   │   │   └── ...
│   │   │   └── _layout.tsx
│   │   │
│   │   ├── components/         # Reusable components
│   │   │   ├── ProductCard.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   └── ...
│   │   │
│   │   └── lib/                # ⭐ API Integration
│   │       ├── api-client.ts   # HTTP client + auth
│   │       ├── api-services.ts # Service layer
│   │       └── endpoints.ts    # API endpoints
│   │
│   ├── .env                    # ⭐ Mobile config (API URL)
│   └── package.json
│
├── PANDUAN_INTEGRASI_MOBILE_BACKEND.md  # ⭐ Panduan lengkap
├── QUICK_START.md                        # ⭐ Quick start
└── ARCHITECTURE_DIAGRAM.md               # ⭐ Dokumen ini
```


## Request/Response Example

```
════════════════════════════════════════════════════════════
 Example: Get All Products
════════════════════════════════════════════════════════════

REQUEST
───────
Method: GET
URL: http://192.168.1.100:8000/api/products
Headers:
  Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
  Accept: application/json


LARAVEL PROCESSING
──────────────────
1. Route Match: routes/api.php
   Route::get('/products', [ProductController::class, 'index'])

2. Middleware: auth:sanctum
   → Verify token
   → Get authenticated user

3. Controller: ProductController@index
   $products = Product::with('category')->get();

4. Database Query:
   SELECT * FROM products
   LEFT JOIN categories ON products.category_id = categories.id

5. Format Response


RESPONSE
────────
Status: 200 OK
Headers:
  Content-Type: application/json

Body:
{
  "status": "success",
  "data": [
    {
      "id": 1,
      "name": "Wedding Decoration Premium",
      "description": "Dekorasi pernikahan lengkap dengan tema modern",
      "price": 25000000,
      "image_url": "http://192.168.1.100:8000/storage/products/deco.jpg",
      "category_id": 1,
      "stock": 10,
      "is_featured": true,
      "on_sale": false,
      "discount_percent": null,
      "category": {
        "id": 1,
        "name": "Decoration",
        "icon": "🎨"
      }
    },
    {
      "id": 2,
      "name": "Wedding Catering Deluxe",
      "description": "Paket catering untuk 500 orang",
      "price": 75000000,
      "image_url": "http://192.168.1.100:8000/storage/products/catering.jpg",
      "category_id": 2,
      "stock": 5,
      "is_featured": true,
      "on_sale": true,
      "discount_percent": 15,
      "category": {
        "id": 2,
        "name": "Catering",
        "icon": "🍽️"
      }
    }
  ]
}


MOBILE APP PROCESSING
─────────────────────
1. API Service Call:
   const products = await API_SERVICES.product.getAll();

2. State Update:
   setProducts(products);

3. UI Render:
   <FlatList data={products} ... />

4. User Sees:
   ┌─────────────────────────┐
   │ 🎨 Wedding Decoration   │
   │ Rp 25.000.000          │
   │ [Add to Cart]          │
   └─────────────────────────┘
   ┌─────────────────────────┐
   │ 🍽️ Wedding Catering    │
   │ Rp 75.000.000 (15% OFF)│
   │ [Add to Cart]          │
   └─────────────────────────┘
```


## Complete Flow: Order Creation

```
┌────────────────────────────────────────────────────────────┐
│  USER CREATES ORDER                                         │
└────────────────────────────────────────────────────────────┘

1. User browses products
   Mobile App → GET /api/products

2. User adds to cart
   Mobile App → POST /api/cart/add
   Body: { package_id: 1, quantity: 1 }
   
3. User views cart
   Mobile App → GET /api/cart
   Response: [{ id: 1, package: {...}, quantity: 1 }]

4. User clicks "Checkout"
   Mobile App → POST /api/orders
   Body: {
     items: [{ package_id: 1, quantity: 1 }],
     event_date: "2024-12-31",
     notes: "Outdoor wedding"
   }

5. Laravel processes:
   - Validate data
   - Create order record
   - Create order_items
   - Clear cart
   - Return order

6. User sees order confirmation
   Order #ORD-2024-001
   Total: Rp 25.000.000
   Status: Pending Payment

7. User pays
   Mobile App → POST /api/orders/1/pay
   Body: { payment_method: "bank_transfer" }

8. Admin views in Filament
   http://localhost:8000/admin/orders
   - Can see order
   - Can update status
   - Can process

9. Order status updates
   Laravel → Database
   Mobile App → GET /api/orders
   User sees: Status = "Confirmed"

✅ Complete!
```

