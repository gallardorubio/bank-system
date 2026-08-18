import { useState } from 'react';
import type { ReactNode } from 'react';
import { Home, Landmark, User, LogOut, BarChart3, Layers, ShieldAlert, Menu, X } from 'lucide-react';

export type TabType = 'home' | 'loans' | 'profile' | 'statistics' | 'escalated' | 'fraud';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
  role: string;
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  onLogout: () => void;
}

export function DashboardLayout({
  children,
  userEmail,
  role,
  activeTab,
  setActiveTab,
  onLogout,
}: DashboardLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const renderDesktopNav = () => {
    if (role === 'client') {
      return (
        <>
          <button onClick={() => setActiveTab('home')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'home' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
            <Home className="w-4 h-4 shrink-0" /> Inicio
          </button>
          <button onClick={() => setActiveTab('loans')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'loans' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
            <Landmark className="w-4 h-4 shrink-0" /> Préstamos
          </button>
          <button onClick={() => setActiveTab('profile')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
            <User className="w-4 h-4 shrink-0" /> Perfil
          </button>
        </>
      );
    }

    return (
      <>
        <button onClick={() => setActiveTab('statistics')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'statistics' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
          <BarChart3 className="w-4 h-4 shrink-0" /> Estadísticas
        </button>
        <button onClick={() => setActiveTab('escalated')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'escalated' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
          <Layers className="w-4 h-4 shrink-0" /> Escalados
        </button>
        <button onClick={() => setActiveTab('fraud')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'fraud' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}>
          <ShieldAlert className="w-4 h-4 shrink-0" /> Fraude
        </button>
      </>
    );
  };

  const renderMobileNav = () => {
    if (role === 'client') {
      return (
        <>
          <button onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'home' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
            <Home className="w-4 h-4" /> Inicio
          </button>
          <button onClick={() => { setActiveTab('loans'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'loans' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
            <Landmark className="w-4 h-4" /> Préstamos
          </button>
          <button onClick={() => { setActiveTab('profile'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'profile' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
            <User className="w-4 h-4" /> Perfil
          </button>
        </>
      );
    }

    return (
      <>
        <button onClick={() => { setActiveTab('statistics'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'statistics' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
          <BarChart3 className="w-4 h-4" /> Estadísticas
        </button>
        <button onClick={() => { setActiveTab('escalated'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'escalated' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
          <Layers className="w-4 h-4" /> Escalados
        </button>
        <button onClick={() => { setActiveTab('fraud'); setMobileMenuOpen(false); }} className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition-colors ${activeTab === 'fraud' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9] hover:text-[#0A2540]'}`}>
          <ShieldAlert className="w-4 h-4" /> Fraude
        </button>
      </>
    );
  };

  return (
    <div className="flex min-h-screen w-full min-w-0 flex-col bg-[#F0F4F9] text-[#0A2540] md:h-screen md:flex-row md:overflow-hidden">
      <div className="border-b border-[#E2E8F0] bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0066FF] text-sm font-black text-white">BS</div>
            <div>
              <p className="text-base font-black tracking-tight text-[#0A2540]">BankSystem</p>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#627D98]">{role}</p>
            </div>
          </div>
          <button type="button" onClick={() => setMobileMenuOpen((prev) => !prev)} aria-label="Abrir menú" className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-[#0A2540]">
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-[#E2E8F0] bg-white px-3 py-3">
            <nav className="flex flex-col gap-2">{renderMobileNav()}</nav>
            <button onClick={onLogout} className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-[#F0F4F9] px-3 py-3 text-xs font-bold text-[#627D98]">
              <LogOut className="h-4 w-4" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>

      <aside className="hidden w-[240px] shrink-0 flex-col justify-between border-r border-[#E2E8F0] bg-white px-5 pb-5 pt-8 md:flex">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shrink-0">
              BS
            </div>
            <span className="font-black text-xl tracking-tight text-[#0A2540] truncate">
              BankSystem
            </span>
          </div>

          <nav className="flex flex-col gap-1.5">{renderDesktopNav()}</nav>
        </div>

        <div className="bg-[#F0F4F9] p-3 rounded-2xl flex flex-col gap-3">
          <div className="overflow-hidden px-1">
            <p className="text-xs font-bold text-[#0A2540] truncate" title={userEmail}>
              {userEmail}
            </p>
            <span className="text-[10px] text-[#627D98] uppercase font-bold tracking-wider">
              {role}
            </span>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-[#627D98] hover:text-[#0A2540] hover:bg-[#E2E8F0]/60 transition-colors text-xs font-bold shadow-sm cursor-pointer">
            <LogOut className="w-4 h-4 shrink-0" /> Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 min-h-0 min-w-0 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10">{children}</main>
    </div>
  );
}