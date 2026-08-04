// src/core/services/coreService.ts
import type { Entry, Account } from '../models/Entry';

export const coreService = {
  getAccountInfo: async (): Promise<Account> => {
    return new Promise((resolve) => setTimeout(() => {
      resolve({ id: 'acc_123', iban: 'ES14 1234 5678 9012 3456', balance: 14502.50, currency: 'EUR' });
    }, 500));
  },

  getEntries: async (): Promise<Entry[]> => {
    return new Promise((resolve) => setTimeout(() => {
      resolve([
        { id: '1', amount: 150.0, currency: 'EUR', concept: 'Bizum de Maria', date: '2026-05-01T10:30:00Z', operationType: 'DEPOSIT', status: 'COMPLETED' },
        { id: '2', amount: 45.90, currency: 'EUR', concept: 'Supermercado Mercadona', date: '2026-04-30T18:15:00Z', operationType: 'FEE', status: 'COMPLETED' },
        { id: '3', amount: 1200.0, currency: 'EUR', concept: 'Nómina Empresa S.A.', date: '2026-04-28T08:00:00Z', operationType: 'DEPOSIT', status: 'COMPLETED' },
        { id: '4', amount: 300.0, currency: 'EUR', concept: 'Cuota Préstamo Coche', date: '2026-04-25T09:00:00Z', operationType: 'LOAN', status: 'COMPLETED' },
        { id: '5', amount: 50.0, currency: 'EUR', concept: 'Transferencia a Juan', date: '2026-04-20T12:00:00Z', operationType: 'TRANSFER', status: 'COMPLETED' }
      ]);
    }, 500));
  }
};