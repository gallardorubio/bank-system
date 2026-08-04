// src/core/models/Entry.ts

export type OperationType = 'TRANSFER' | 'DEPOSIT' | 'LOAN' | 'FEE';

export interface Entry {
  id: string;
  amount: number;
  currency: string;
  concept: string;
  date: string;
  operationType: OperationType;
  status: 'COMPLETED' | 'PENDING' | 'REJECTED';
}

export interface Account {
  id: string;
  iban: string;
  balance: number;
  currency: string;
}