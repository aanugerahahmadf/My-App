/**
 * API Services
 * 
 * Layer tambahan untuk mempermudah penggunaan API di komponen.
 * Semua fungsi di sini menggunakan api-client.ts dan endpoints.ts
 */

import { apiGet, apiPost, apiPut, apiDelete } from './api-client';
import { API } from './endpoints';

// ==================== TYPES ====================

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  stock: number;
  is_featured: boolean;
  on_sale: boolean;
  discount_percent?: number;
}

export interface Package {
  id: number;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category_id: number;
  is_featured: boolean;
  on_sale: boolean;
  items: PackageItem[];
}

export interface PackageItem {
  id: number;
  product_id: number;
  quantity: number;
  product: Product;
}

export interface Category {
  id: number;
  name: string;
  description: string;
  icon: string;
  packages?: Package[];
}

export interface CartItem {
  id: number;
  package_id: number;
  quantity: number;
  package: Package;
}

export interface Order {
  id: number;
  order_number: string;
  status: string;
  total_amount: number;
  payment_status: string;
  event_date: string;
  created_at: string;
  items: OrderItem[];
}

export interface OrderItem {
  id: number;
  package_id: number;
  quantity: number;
  price: number;
  package: Package;
}

export interface Review {
  id: number;
  package_id: number;
  user_id: number;
  rating: number;
  comment: string;
  created_at: string;
  user: User;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
}

export interface Conversation {
  id: number;
  organizer_id: number;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  organizer: {
    id: number;
    name: string;
    avatar_url?: string;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  message: string;
  created_at: string;
  is_mine: boolean;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  errors?: any;
}

// ==================== PRODUCTS ====================

export const ProductService = {
  /**
   * Get all products
   */
  async getAll(): Promise<Product[]> {
    const response = await apiGet<ApiResponse<Product[]>>(API.PRODUCTS.ALL);
    return response.data || [];
  },

  /**
   * Get public products (no auth required)
   */
  async getPublic(): Promise<Product[]> {
    const response = await apiGet<ApiResponse<Product[]>>(API.PRODUCTS.PUBLIC);
    return response.data || [];
  },

  /**
   * Get featured products
   */
  async getFeatured(): Promise<Product[]> {
    const response = await apiGet<ApiResponse<Product[]>>(API.PRODUCTS.FEATURED);
    return response.data || [];
  },

  /**
   * Get products on sale
   */
  async getOnSale(): Promise<Product[]> {
    const response = await apiGet<ApiResponse<Product[]>>(API.PRODUCTS.ON_SALE);
    return response.data || [];
  },

  /**
   * Get product detail by ID
   */
  async getById(id: number): Promise<Product> {
    const response = await apiGet<ApiResponse<Product>>(API.PRODUCTS.DETAIL(id));
    return response.data!;
  },
};

// ==================== PACKAGES ====================

export const PackageService = {
  /**
   * Get all packages
   */
  async getAll(): Promise<Package[]> {
    const response = await apiGet<ApiResponse<Package[]>>(API.PACKAGES.ALL);
    return response.data || [];
  },

  /**
   * Get public packages (no auth required)
   */
  async getPublic(): Promise<Package[]> {
    const response = await apiGet<ApiResponse<Package[]>>(API.PACKAGES.PUBLIC);
    return response.data || [];
  },

  /**
   * Get featured packages
   */
  async getFeatured(): Promise<Package[]> {
    const response = await apiGet<ApiResponse<Package[]>>(API.PACKAGES.FEATURED);
    return response.data || [];
  },

  /**
   * Get packages on sale
   */
  async getOnSale(): Promise<Package[]> {
    const response = await apiGet<ApiResponse<Package[]>>(API.PACKAGES.ON_SALE);
    return response.data || [];
  },

  /**
   * Get package detail by ID
   */
  async getById(id: number): Promise<Package> {
    const response = await apiGet<ApiResponse<Package>>(API.PACKAGES.DETAIL(id));
    return response.data!;
  },
};

// ==================== CATEGORIES ====================

export const CategoryService = {
  /**
   * Get all categories
   */
  async getAll(): Promise<Category[]> {
    const response = await apiGet<ApiResponse<Category[]>>(API.CATEGORIES);
    return response.data || [];
  },

  /**
   * Get categories with top packages
   */
  async getWithPackages(): Promise<Category[]> {
    const response = await apiGet<ApiResponse<Category[]>>(
      `${API.CATEGORIES}-with-packages`
    );
    return response.data || [];
  },
};

// ==================== CART ====================

export const CartService = {
  /**
   * Get cart items
   */
  async getItems(): Promise<CartItem[]> {
    const response = await apiGet<ApiResponse<CartItem[]>>(API.CART.INDEX);
    return response.data || [];
  },

  /**
   * Add item to cart
   */
  async addItem(packageId: number, quantity: number = 1): Promise<CartItem> {
    const response = await apiPost<ApiResponse<CartItem>>(API.CART.ADD, {
      package_id: packageId,
      quantity,
    });
    return response.data!;
  },

  /**
   * Update cart item quantity
   */
  async updateQuantity(cartId: number, quantity: number): Promise<CartItem> {
    const response = await apiPut<ApiResponse<CartItem>>(
      API.CART.UPDATE(cartId),
      { quantity }
    );
    return response.data!;
  },

  /**
   * Remove item from cart
   */
  async removeItem(cartId: number): Promise<void> {
    await apiDelete(API.CART.DELETE(cartId));
  },
};

// ==================== ORDERS ====================

export const OrderService = {
  /**
   * Get all orders
   */
  async getAll(): Promise<Order[]> {
    const response = await apiGet<ApiResponse<Order[]>>(API.ORDERS.ALL);
    return response.data || [];
  },

  /**
   * Create new order
   */
  async create(data: {
    items: { package_id: number; quantity: number }[];
    event_date: string;
    notes?: string;
    voucher_code?: string;
  }): Promise<Order> {
    const response = await apiPost<ApiResponse<Order>>(API.ORDERS.CREATE, data);
    return response.data!;
  },

  /**
   * Process payment for order
   */
  async pay(orderId: number, paymentMethod: string): Promise<any> {
    const response = await apiPost<ApiResponse<any>>(
      API.ORDERS.PAY(orderId),
      { payment_method: paymentMethod }
    );
    return response.data!;
  },

  /**
   * Track order by order number
   */
  async track(orderNumber: string): Promise<Order> {
    const response = await apiGet<ApiResponse<Order>>(
      API.ORDERS.TRACK(orderNumber)
    );
    return response.data!;
  },

  /**
   * Cancel order
   */
  async cancel(orderId: number, reason?: string): Promise<Order> {
    const response = await apiPost<ApiResponse<Order>>(
      API.ORDERS.CANCEL(orderId),
      { reason }
    );
    return response.data!;
  },
};

// ==================== CHAT ====================

export const ChatService = {
  /**
   * Get all conversations
   */
  async getConversations(): Promise<Conversation[]> {
    const response = await apiGet<ApiResponse<Conversation[]>>(
      API.CHAT.CONVERSATIONS
    );
    return response.data || [];
  },

  /**
   * Get messages from a conversation
   */
  async getMessages(conversationId: number): Promise<Message[]> {
    const response = await apiGet<ApiResponse<Message[]>>(
      API.CHAT.MESSAGES(conversationId)
    );
    return response.data || [];
  },

  /**
   * Send message
   */
  async sendMessage(conversationId: number, message: string): Promise<Message> {
    const response = await apiPost<ApiResponse<Message>>(API.CHAT.SEND, {
      conversation_id: conversationId,
      message,
    });
    return response.data!;
  },

  /**
   * Start new conversation
   */
  async startConversation(organizerId: number, message: string): Promise<Conversation> {
    const response = await apiPost<ApiResponse<Conversation>>(API.CHAT.START, {
      organizer_id: organizerId,
      message,
    });
    return response.data!;
  },

  /**
   * Get unread message count
   */
  async getUnreadCount(): Promise<number> {
    const response = await apiGet<ApiResponse<{ count: number }>>(
      API.CHAT.UNREAD
    );
    return response.data?.count || 0;
  },
};

// ==================== PROFILE ====================

export const ProfileService = {
  /**
   * Get user profile
   */
  async get(): Promise<User> {
    const response = await apiGet<ApiResponse<User>>(API.PROFILE.SHOW);
    return response.data!;
  },

  /**
   * Update profile
   */
  async update(data: {
    name?: string;
    email?: string;
    phone?: string;
  }): Promise<User> {
    const response = await apiPut<ApiResponse<User>>(API.PROFILE.UPDATE, data);
    return response.data!;
  },

  /**
   * Update avatar
   */
  async updateAvatar(imageUri: string): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const response = await apiPost<ApiResponse<User>>(
      API.PROFILE.AVATAR,
      formData
    );
    return response.data!;
  },

  /**
   * Change password
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    await apiPost(API.PROFILE.PASSWORD, {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    });
  },
};

// ==================== REVIEWS ====================

export const ReviewService = {
  /**
   * Get user's reviews
   */
  async getUserReviews(): Promise<Review[]> {
    const response = await apiGet<ApiResponse<Review[]>>(API.REVIEWS.USER);
    return response.data || [];
  },

  /**
   * Get reviews for a package
   */
  async getPackageReviews(packageId: number): Promise<Review[]> {
    const response = await apiGet<ApiResponse<Review[]>>(
      API.REVIEWS.PACKAGE(packageId)
    );
    return response.data || [];
  },

  /**
   * Create review
   */
  async create(data: {
    package_id: number;
    rating: number;
    comment: string;
  }): Promise<Review> {
    const response = await apiPost<ApiResponse<Review>>(API.REVIEWS.STORE, data);
    return response.data!;
  },

  /**
   * Update review
   */
  async update(
    reviewId: number,
    data: { rating?: number; comment?: string }
  ): Promise<Review> {
    const response = await apiPut<ApiResponse<Review>>(
      API.REVIEWS.UPDATE(reviewId),
      data
    );
    return response.data!;
  },

  /**
   * Delete review
   */
  async delete(reviewId: number): Promise<void> {
    await apiDelete(API.REVIEWS.DELETE(reviewId));
  },
};

// ==================== WISHLIST ====================

export const WishlistService = {
  /**
   * Get wishlist items
   */
  async getItems(): Promise<Package[]> {
    const response = await apiGet<ApiResponse<Package[]>>(API.WISHLIST.INDEX);
    return response.data || [];
  },

  /**
   * Toggle wishlist (add/remove)
   */
  async toggle(packageId: number): Promise<{ in_wishlist: boolean }> {
    const response = await apiPost<ApiResponse<{ in_wishlist: boolean }>>(
      API.WISHLIST.TOGGLE,
      { package_id: packageId }
    );
    return response.data!;
  },

  /**
   * Check if package is in wishlist
   */
  async check(packageId: number): Promise<boolean> {
    const response = await apiGet<ApiResponse<{ in_wishlist: boolean }>>(
      API.WISHLIST.CHECK(packageId)
    );
    return response.data?.in_wishlist || false;
  },
};

// ==================== SEARCH ====================

export const SearchService = {
  /**
   * Search by text
   */
  async searchText(query: string): Promise<{
    packages: Package[];
    products: Product[];
  }> {
    const response = await apiGet<ApiResponse<any>>(
      `${API.SEARCH.TEXT}?q=${encodeURIComponent(query)}`
    );
    return response.data || { packages: [], products: [] };
  },

  /**
   * Search by image (CBIR)
   */
  async searchImage(imageUri: string): Promise<any[]> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'query.jpg',
    } as any);

    const response = await apiPost<ApiResponse<any[]>>(
      API.SEARCH.IMAGE,
      formData
    );
    return (response.data || []).map((item: any) => ({
      ...(item.package || item.product || item),
      similarity: item.similarity ?? 0,
      score: item.score ?? 0,
    }));
  },

  /**
   * Search similar images using CBIR
   */
  async searchSimilar(imageUri: string, method: string = 'combined'): Promise<any[]> {
    const formData = new FormData();
    formData.append('image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'query.jpg',
    } as any);
    formData.append('method', method);

    const response = await apiPost<ApiResponse<any[]>>(
      API.CBIR.SEARCH,
      formData
    );
    return response.data || [];
  },
};

// ==================== HOME ====================

export const HomeService = {
  /**
   * Get home page data
   */
  async getData(): Promise<{
    featured_packages: Package[];
    categories: Category[];
    on_sale_packages: Package[];
  }> {
    const response = await apiGet<ApiResponse<any>>(API.HOME);
    return response.data || {
      featured_packages: [],
      categories: [],
      on_sale_packages: [],
    };
  },
};

// ==================== SETTINGS ====================

export const SettingsService = {
  /**
   * Get app settings
   */
  async get(): Promise<{
    app_name: string;
    owner_name: string;
    demo_video_url?: string;
  }> {
    const response = await apiGet<ApiResponse<any>>(API.SETTINGS);
    return response.data || {
      app_name: 'Wedding Flowers Decorasi',
      owner_name: 'Admin',
    };
  },
};

// ==================== HEALTH CHECK ====================

export const HealthService = {
  /**
   * Ping backend to check connection
   */
  async ping(): Promise<{
    status: string;
    timestamp: string;
    db_status: string;
    user_count: number;
  }> {
    const response = await apiGet<any>(`${API.SETTINGS.replace('/settings', '')}/ping`);
    return response;
  },
};

// Export all services
export const API_SERVICES = {
  product: ProductService,
  package: PackageService,
  category: CategoryService,
  cart: CartService,
  order: OrderService,
  chat: ChatService,
  profile: ProfileService,
  review: ReviewService,
  wishlist: WishlistService,
  search: SearchService,
  home: HomeService,
  settings: SettingsService,
  health: HealthService,
};
