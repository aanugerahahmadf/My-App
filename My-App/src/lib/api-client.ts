import * as SecureStore from 'expo-secure-store';
import { API } from './endpoints';

const SANCTUM_TOKEN_KEY = 'sanctum_token';

// --- In-memory token cache (no SecureStore read on every call) ---
let cachedToken: string | null | undefined = undefined;

export async function getSanctumToken(): Promise<string | null> {
  if (cachedToken !== undefined) return cachedToken;
  cachedToken = await SecureStore.getItemAsync(SANCTUM_TOKEN_KEY);
  return cachedToken;
}

export function setSanctumToken(token: string): Promise<void> {
  cachedToken = token;
  return SecureStore.setItemAsync(SANCTUM_TOKEN_KEY, token);
}

export async function clearSanctumToken(): Promise<void> {
  cachedToken = null;
  await SecureStore.deleteItemAsync(SANCTUM_TOKEN_KEY);
}

// --- Request timeout ---
function fetchWithTimeout(url: string, options: RequestInit, ms = 15000) {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(id));
}

// --- GET response cache (10s TTL) ---
const cache = new Map<string, { data: any; expires: number }>();
const CACHE_TTL = 10_000;

function getCached(key: string) {
  const entry = cache.get(key);
  if (entry && Date.now() < entry.expires) return entry.data;
  cache.delete(key);
  return undefined;
}

function setCache(key: string, data: any) {
  cache.set(key, { data, expires: Date.now() + CACHE_TTL });
}

export function clearApiCache() {
  cache.clear();
}

// --- sync Clerk → Sanctum ---
export async function syncClerkToSanctum(
  clerkId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<string> {
  const body = JSON.stringify({
    clerk_id: clerkId,
    email,
    name,
    avatar_url: avatarUrl,
  });

  const res = await fetchWithTimeout(API.AUTH.CLERK_SYNC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error('Gagal sync auth: ' + err);
  }

  const data = await res.json();
  const token = data.token || data.data?.token;
  if (!token) throw new Error('Token tidak ditemukan');

  await setSanctumToken(token);
  return token;
}

// --- Core fetch wrapper ---
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await getSanctumToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.method !== undefined && options.method !== 'GET') {
    headers['Content-Type'] = 'application/json';
  }

  return fetchWithTimeout(url, { ...options, headers });
}

// --- Shortcuts ---
export async function apiGet<T = any>(url: string): Promise<T> {
  const cached = getCached(url);
  if (cached) return cached as T;
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  const data = await res.json();
  setCache(url, data);
  return data;
}

export async function apiPost<T = any>(
  url: string,
  body?: any
): Promise<T> {
  cache.delete(url); // bust GET cache for this URL
  const isFormData = body instanceof FormData;
  const res = await apiFetch(url, {
    method: 'POST',
    body: isFormData ? body : body ? JSON.stringify(body) : undefined,
    headers: isFormData ? {} : { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error(`POST ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiPut<T = any>(
  url: string,
  body?: any
): Promise<T> {
  cache.delete(url);
  const res = await apiFetch(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  cache.delete(url);
  const res = await apiFetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
  return res.json();
}
