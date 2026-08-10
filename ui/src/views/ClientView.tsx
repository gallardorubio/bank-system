import { useUserVM } from '../viewmodels/useUserVM';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowUpRight, ArrowDownLeft, Shield, Lock } from 'lucide-react';

interface ClientViewProps {
  activeTab?: 'home' | 'operations' | 'profile';
}

export function ClientView({ activeTab = 'home' }: ClientViewProps) {
  const vm = useUserVM();

  if (vm.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0066FF] animate-pulse">Cargando dashboard...</span>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="max-w-2xl mx-auto flex flex-col gap-4">
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4">Perfil de cliente</h2>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#F0F4F9] p-3 rounded-xl">
              <span className="text-[#627D98] block">Nombre</span>
              <span className="font-bold">{vm.client?.name || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-3 rounded-xl">
              <span className="text-[#627D98] block">Email</span>
              <span className="font-bold">{vm.client?.email || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-3 rounded-xl">
              <span className="text-[#627D98] block">Teléfono</span>
              <span className="font-bold">{vm.client?.phone || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-3 rounded-xl">
              <span className="text-[#627D98] block">Tax ID</span>
              <span className="font-bold">{vm.client?.taxId || 'N/A'}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      <div>
        <span className="text-xs text-[#627D98] font-bold uppercase tracking-wider">Bienvenido</span>
        <h1 className="text-3xl font-black text-[#0A2540]">{vm.client?.name || 'Cliente'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#0A2540] text-white rounded-[28px] p-8 flex flex-col justify-between h-[200px]">
          <div>
            <span className="text-xs text-[#627D98] font-bold uppercase tracking-wider">Balance Disponible</span>
            <div className="text-4xl font-black mt-2 tracking-tight">$0.00</div>
          </div>
          <div className="flex gap-3">
            <Button variant="primary" size="sm" className="gap-2">
              <ArrowUpRight className="w-4 h-4" /> Transferir
            </Button>
            <Button variant="secondary" size="sm" className="gap-2">
              <ArrowDownLeft className="w-4 h-4" /> Depositar
            </Button>
          </div>
        </div>

        <Card className="flex flex-col justify-between h-[200px] p-6">
          <div>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] text-[#0066FF] flex items-center justify-center mb-2">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm">Seguridad de la cuenta</h3>
            <p className="text-xs text-[#627D98]">Autenticación de dos factores</p>
          </div>
          <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-xs font-bold">{vm.client?.mfaEnabled ? 'MFA Activo' : 'MFA Inactivo'}</span>
            <Button variant="ghost" size="sm"><Lock className="w-3.5 h-3.5" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}