import { useMemo, useState } from 'react';
import { useAuth } from 'react-oidc-context';
import { AuthLayout } from './layouts/AuthLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ClientView } from './views/ClientView';
import { RegisterView } from './views/RegisterView';
import { OperatorView } from './views/OperatorView';
import { Button } from './components/Button';
import { Loader2 } from 'lucide-react';

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
          <span className="text-xs font-bold tracking-wider uppercase text-[#627D98]">Iniciando</span>
        </div>
      </div>
    );
  }

  if (!auth.isAuthenticated) {
    return (
      <AuthLayout>
        {isRegistering ? (
          <RegisterView 
            onSuccess={() => setIsRegistering(false)} 
            onCancel={() => setIsRegistering(false)} 
          />
        ) : (
          <div className="p-16 flex flex-col justify-center gap-10">
            <div className="space-y-3">
              <h1 className="text-5xl font-black text-[#0A2540] tracking-tight">Acceso</h1>
              <p className="text-lg text-[#627D98]">Ingresa a tu banca en línea o crea una cuenta en segundos.</p>
            </div>
            <div className="flex flex-col gap-5">
              <Button 
                variant="primary" 
                onClick={() => auth.signinRedirect({ extraQueryParams: { lang: 'es' } })} 
                className="w-full py-4 text-base font-bold shadow-sm"
              >
                Iniciar sesión
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => setIsRegistering(true)} 
                className="w-full py-4 text-base font-bold"
              >
                Crear cuenta
              </Button>
            </div>
          </div>
        )}
      </AuthLayout>
    );
  }

  return (
    <DashboardLayout
      userEmail={auth.user?.profile.email}
      role={role}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      onLogout={handleLogout}
    >
      {role === 'operator' ? <OperatorView /> : <ClientView activeTab={activeTab} />}
    </DashboardLayout>
  );
}