// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomeView from './features/home/HomeView';
import EntriesView from './features/entries/EntriesView';
import TransferView from './features/transfers/TransferView';
import AccountDetailView from './features/accounts/AccountDetailView';
import LoansView from './features/loans/LoansView';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomeView />} />
          <Route path="/entries" element={<EntriesView />} />
          <Route path="/transfer" element={<TransferView />} />
          <Route path="/accounts/:id" element={<AccountDetailView />} />
          <Route path="/products" element={<LoansView />} />
          {/* Rutas placeholder para evitar errores al hacer clic en NavLinks */}
          <Route path="/contract" element={<div className="p-6">Vista Contratar en construcción</div>} />
          <Route path="/help" element={<div className="p-6">Vista Ayuda en construcción</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}