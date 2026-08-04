// src/store/useAccountStore.ts
import { create } from 'zustand';
import { coreService } from '../core/services/coreService';
import type { Account, Entry } from '../core/models/Entry';

interface AccountState {
  account: Account | null;
  entries: Entry[];
  isLoading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
}

export const useAccountStore = create<AccountState>((set) => ({
  account: null,
  entries: [],
  isLoading: false,
  error: null,

  fetchData: async () => {
    set({ isLoading: true, error: null });
    try {
      const [accountData, entriesData] = await Promise.all([
        coreService.getAccountInfo(),
        coreService.getEntries()
      ]);
      set({ account: accountData, entries: entriesData, isLoading: false });
    } catch (err) {
      set({ error: 'Error al cargar los datos', isLoading: false });
    }
  }
}));