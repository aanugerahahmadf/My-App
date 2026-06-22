const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api'

export const API = {
  AUTH: {
    CLERK_SYNC: `${API_BASE}/auth/clerk-sync`,
    LOGOUT: `${API_BASE}/logout`,
  },
  HOME: `${API_BASE}/home`,
  CATEGORIES: `${API_BASE}/categories`,
  PACKAGES: {
    ALL: `${API_BASE}/packages`,
    PUBLIC: `${API_BASE}/packages/public`,
    FEATURED: `${API_BASE}/packages/featured`,
    ON_SALE: `${API_BASE}/packages/on-sale`,
    DETAIL: (id: number) => `${API_BASE}/packages/${id}`,
  },
  PRODUCTS: {
    ALL: `${API_BASE}/products`,
    PUBLIC: `${API_BASE}/products/public`,
    FEATURED: `${API_BASE}/products/featured`,
    ON_SALE: `${API_BASE}/products/on-sale`,
    DETAIL: (id: number) => `${API_BASE}/products/${id}`,
  },
  CART: {
    INDEX: `${API_BASE}/cart`,
    ADD: `${API_BASE}/cart/add`,
    UPDATE: (id: number) => `${API_BASE}/cart/${id}`,
    DELETE: (id: number) => `${API_BASE}/cart/${id}`,
  },
  ORDERS: {
    ALL: `${API_BASE}/orders`,
    CREATE: `${API_BASE}/orders`,
    PAY: (id: number) => `${API_BASE}/orders/${id}/pay`,
    TRACK: (no: string) => `${API_BASE}/bookings/track/${no}`,
    CANCEL: (id: number) => `${API_BASE}/orders/${id}/cancel`,
  },
  CHAT: {
    CONVERSATIONS: `${API_BASE}/messages/conversations`,
    MESSAGES: (id: number) => `${API_BASE}/messages/conversations/${id}`,
    SEND: `${API_BASE}/messages/send`,
    START: `${API_BASE}/messages/start`,
    UNREAD: `${API_BASE}/messages/unread-count`,
  },
  PROFILE: {
    SHOW: `${API_BASE}/profile`,
    UPDATE: `${API_BASE}/profile`,
    AVATAR: `${API_BASE}/profile/avatar`,
    PASSWORD: `${API_BASE}/profile/change-password`,
  },
  REVIEWS: {
    USER: `${API_BASE}/reviews/user`,
    STORE: `${API_BASE}/reviews`,
    UPDATE: (id: number) => `${API_BASE}/reviews/${id}`,
    DELETE: (id: number) => `${API_BASE}/reviews/${id}`,
    PACKAGE: (id: number) => `${API_BASE}/reviews/package/${id}`,
  },
  HISTORY: `${API_BASE}/histories`,
  WISHLIST: {
    INDEX: `${API_BASE}/wishlist`,
    TOGGLE: `${API_BASE}/wishlist/toggle`,
    CHECK: (id: number) => `${API_BASE}/wishlist/${id}/check`,
  },
  VOUCHERS: {
    INDEX: `${API_BASE}/vouchers`,
    CLAIM: (id: number) => `${API_BASE}/vouchers/${id}/claim`,
  },
  SEARCH: {
    TEXT: `${API_BASE}/search`,
    IMAGE: `${API_BASE}/search/image`,
  },
  CBIR: {
    SEARCH: `${API_BASE}/cbir/search`,
    STATS: `${API_BASE}/cbir/stats`,
  },
  WALLET: {
    SHOW: `${API_BASE}/wallet`,
    HISTORY: `${API_BASE}/wallet/history`,
    WITHDRAWAL: `${API_BASE}/wallet/withdrawal`,
  },
  SETTINGS: `${API_BASE}/settings`,
  LEGAL: {
    ABOUT: `${API_BASE}/legal/about`,
    HELP: `${API_BASE}/legal/help`,
    PRIVACY: `${API_BASE}/legal/privacy`,
  },
  NOTIFICATIONS: {
    LIST: `${API_BASE}/notifications`,
    READ: (id: number) => `${API_BASE}/notifications/${id}/read`,
    READ_ALL: `${API_BASE}/notifications/read-all`,
  },
  USER_LANGUAGE: `${API_BASE}/user/language`,
}

export type API_TYPE = typeof API
