import * as SecureStore from 'expo-secure-store';

const ACCOUNTS_KEY = 'saved_accounts';

export type SavedAccount = {
  clerkId: string;
  email: string;
  name: string;
  avatarUrl?: string;
};

async function getAccounts(): Promise<SavedAccount[]> {
  try {
    const raw = await SecureStore.getItemAsync(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

async function setAccounts(list: SavedAccount[]): Promise<void> {
  await SecureStore.setItemAsync(ACCOUNTS_KEY, JSON.stringify(list));
}

export async function saveAccount(account: SavedAccount): Promise<void> {
  const list = await getAccounts();
  const filtered = list.filter((a) => a.clerkId !== account.clerkId);
  filtered.unshift(account);
  await setAccounts(filtered.slice(0, 5));
}

export async function getSavedAccounts(): Promise<SavedAccount[]> {
  return getAccounts();
}

export async function removeAccount(clerkId: string): Promise<void> {
  const list = await getAccounts();
  await setAccounts(list.filter((a) => a.clerkId !== clerkId));
}
