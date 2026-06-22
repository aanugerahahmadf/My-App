import * as SecureStore from 'expo-secure-store';
import { API } from './endpoints';

const SANCTUM_TOKEN_KEY = 'sanctum_token';

export async function getSanctumToken(): Promise<string | null> {
  return SecureStore.getItemAsync(SANCTUM_TOKEN_KEY);
}

export async function setSanctumToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(SANCTUM_TOKEN_KEY, token);
}

export async function clearSanctumToken(): Promise<void> {
  await SecureStore.deleteItemAsync(SANCTUM_TOKEN_KEY);
}

export async function syncClerkToSanctum(
  clerkId: string,
  email: string,
  name: string,
  avatarUrl?: string
): Promise<string> {
  const res = await fetch(API.AUTH.CLERK_SYNC, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      clerk_id: clerkId,
      email,
      name,
      avatar_url: avatarUrl,
    }),
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

  return fetch(url, { ...options, headers });
}

export async function apiGet<T = any>(url: string): Promise<T> {
  const res = await apiFetch(url);
  if (!res.ok) throw new Error(`GET ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiPost<T = any>(
  url: string,
  body?: any
): Promise<T> {
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
  const res = await apiFetch(url, {
    method: 'PUT',
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`PUT ${url} failed: ${res.status}`);
  return res.json();
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const res = await apiFetch(url, { method: 'DELETE' });
  if (!res.ok) throw new Error(`DELETE ${url} failed: ${res.status}`);
  return res.json();
}
