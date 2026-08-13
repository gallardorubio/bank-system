import type { ReactNode } from 'react';
import { Home, Landmark, User, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
  role: string;
  activeTab: 'home' | 'loans' | 'profile';
  setActiveTab: (tab: 'home' | 'loans' | 'profile') => void;
  onLogout: () => void;
}

export function DashboardLayout({ children, userEmail, role, activeTab, setActiveTab, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#F0F4F9] text-[#0A2540] overflow-hidden">
      <aside className="w-[220px] bg-white border-r border-[#E2E8F0] pt-8 px-5 pb-5 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-black text-sm shrink-0">BS</div>
            <span className="font-black text-xl tracking-tight text-[#0A2540] truncate">BankSystem</span>
          </div>
          {role === 'client' && (
            <nav className="flex flex-col gap-1.5">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'home' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <Home className="w-4 h-4 shrink-0" /> Inicio
              </button>
              <button 
                onClick={() => setActiveTab('loans')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'loans' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <Landmark className="w-4 h-4 shrink-0" /> Préstamos
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <User className="w-4 h-4 shrink-0" /> Perfil
              </button>
            </nav>
          )}
        </div>
        <div className="bg-[#F0F4F9] p-3 rounded-2xl flex flex-col gap-3">
          <div className="overflow-hidden px-1">
            <p className="text-xs font-bold text-[#0A2540] truncate" title={userEmail}>{userEmail}</p>
            <span className="text-[10px] text-[#627D98] uppercase font-bold tracking-wider">{role}</span>
          </div>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white text-[#627D98] hover:text-[#0A2540] hover:bg-[#E2E8F0]/60 transition-colors text-xs font-bold shadow-sm cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}