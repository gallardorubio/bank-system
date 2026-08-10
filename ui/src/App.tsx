import { useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { ClientView } from './views/ClientView';
import { RegisterView } from './views/RegisterView';
import { OperatorView } from './views/OperatorView';
import { Button } from './components/Button';
import { Loader2, Home, ArrowLeftRight, User, LogOut, ShieldCheck } from 'lucide-react';

export default function App() {
  const auth = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'operations' | 'profile'>('home');

  const role = useMemo(() => {
    const profile = auth.user?.profile as Record<string, unknown> | undefined;
    if (!profile) return 'client';
    const groups = (profile['cognito:groups'] || profile['groups'] || profile['roles']) as string[] | string | undefined;
    if (Array.isArray(groups) && groups.some(g => g.toLowerCase().includes('operator') || g.toLowerCase().includes('admin'))) return 'operator';
    if (typeof groups === 'string' && (groups.toLowerCase().includes('operator') || groups.toLowerCase().includes('admin'))) return 'operator';
    return 'client';
  }, [auth.user?.profile]);

  const handleLogout = () => {
    const clientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
    const logoutUri = import.meta.env.VITE_COGNITO_REDIRECT_URI;
    const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN;
    auth.removeUser();
    window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
  };

  if (auth.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F0F4F9]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
          <span className="text-xs font-bold tracking-wider uppercase text-[#627D98]">Iniciando BankSystem...</span>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    if (isRegistering) {
      return <RegisterView onSuccess={() => setIsRegistering(false)} onCancel={() => setIsRegistering(false)} />;
    }

    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F0F4F9] p-4">
        <div className="grid w-full max-w-4xl h-[520px] grid-cols-1 md:grid-cols-2 rounded-[32px] overflow-hidden bg-white border border-[#E2E8F0] shadow-sm">
          <div className="bg-[#0A2540] p-10 text-white flex flex-col justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#0066FF] flex items-center justify-center font-black text-base tracking-tighter">BS</div>
              <span className="font-black tracking-tight text-xl">BankSystem</span>
            </div>
            <div>
              <h2 className="text-4xl font-extrabold leading-tight tracking-tight mb-3">Tu banca.<br/>Sin complicaciones.</h2>
              <p className="text-xs text-[#627D98] leading-relaxed">Gestiona tu capital con rendimiento en tiempo real y seguridad bancaria.</p>
            </div>
            <div className="flex items-center gap-2 text-[11px] bg-white/10 px-3.5 py-2 rounded-xl w-fit">
              <ShieldCheck className="w-4 h-4 text-[#00F0FF]" /> Cifrado activo de 256 bits
            </div>
          </div>

          <div className="p-10 flex flex-col justify-center gap-6">
            <div>
              <h1 className="text-3xl font-black text-[#0A2540]">Acceso</h1>
              <p className="text-xs text-[#627D98] mt-1">Ingresa a tu banca en línea o crea una cuenta en segundos.</p>
            </div>
            <div className="flex flex-col gap-3">
              <Button variant="primary" onClick={() => auth.signinRedirect()} className="w-full">
                Iniciar sesión
              </Button>
              <Button variant="secondary" onClick={() => setIsRegistering(true)} className="w-full">
                Crear cuenta
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#F0F4F9] text-[#0A2540] overflow-hidden">
      <aside className="w-64 bg-white border-r border-[#E2E8F0] p-6 flex flex-col justify-between hidden md:flex shrink-0">
        <div className="flex flex-col gap-8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-xl bg-[#0066FF] flex items-center justify-center text-white font-black text-sm">BS</div>
            <span className="font-black text-xl tracking-tight text-[#0A2540]">BankSystem</span>
          </div>
          {role === 'client' && (
            <nav className="flex flex-col gap-1">
              <button 
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'home' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <Home className="w-4 h-4" /> Inicio
              </button>
              <button 
                onClick={() => setActiveTab('operations')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'operations' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <ArrowLeftRight className="w-4 h-4" /> Movimientos
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-bold transition-all ${activeTab === 'profile' ? 'bg-[#0A2540] text-white' : 'text-[#627D98] hover:bg-[#F0F4F9]'}`}
              >
                <User className="w-4 h-4" /> Perfil
              </button>
            </nav>
          )}
        </div>
        <div className="bg-[#F0F4F9] p-3.5 rounded-2xl flex items-center justify-between">
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate">{auth.user?.profile.email}</p>
            <span className="text-[10px] text-[#627D98] uppercase font-bold">{role}</span>
          </div>
          <button onClick={handleLogout} className="text-[#627D98] hover:text-red-500 p-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-hidden">
        {role === 'operator' ? <OperatorView /> : <ClientView activeTab={activeTab} />}
      </main>
    </div>
  );
}