import type { ReactNode } from 'react';
import { Home, ArrowLeftRight, User, LogOut } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  userEmail?: string;
  role: string;
  activeTab: 'home' | 'operations' | 'profile';
  setActiveTab: (tab: 'home' | 'operations' | 'profile') => void;
  onLogout: () => void;
}

export function DashboardLayout({ children, userEmail, role, activeTab, setActiveTab, onLogout }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen w-full bg-[#F0F4F9] text-[#0A2540] overflow-hidden">
      <aside className="w-60 bg-white border-r border-[#E2E8F0] p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-black text-sm">BS</div>
            <span className="font-black text-xl tracking-tight text-[#0A2540]">BankSystem</span>
          </div>
          {role === 'client' && (
            <nav className="flex flex-col gap-1.5">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'home' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <Home className="w-4 h-4" /> Inicio
              </button>
              <button 
                onClick={() => setActiveTab('operations')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'operations' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <ArrowLeftRight className="w-4 h-4" /> Movimientos
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${activeTab === 'profile' ? 'bg-[#0A2540] text-white shadow-sm' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <User className="w-4 h-4" /> Perfil
              </button>
            </nav>
          )}
        </div>
        <div className="bg-[#F0F4F9] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-[#0A2540] truncate">{userEmail}</p>
            <span className="text-[10px] text-[#627D98] uppercase font-bold tracking-wider">{role}</span>
          </div>
          <button onClick={onLogout} className="text-[#627D98] hover:text-red-500 p-1.5 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}