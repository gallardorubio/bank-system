import { useUserVM } from '../viewmodels/useUserVM';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { ArrowUpRight, ArrowDownLeft, Shield, Lock, BotMessageSquare } from 'lucide-react';

interface ClientViewProps {
  activeTab?: 'home' | 'operations' | 'profile';
}

export function ClientView({ activeTab = 'home' }: ClientViewProps) {
  const vm = useUserVM();

  if (vm.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm font-bold uppercase tracking-widest text-[#0066FF] animate-pulse">Cargando plataforma...</span>
      </div>
    );
  }

  if (activeTab === 'profile') {
    return (
      <div className="max-w-3xl mx-auto flex flex-col gap-8">
        <Card className="p-10">
          <h2 className="text-3xl font-black mb-8">Mi Perfil</h2>
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="bg-[#F0F4F9] p-6 rounded-3xl">
              <span className="text-[#627D98] block mb-1">Nombre</span>
              <span className="font-bold text-base">{vm.client?.name || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-6 rounded-3xl">
              <span className="text-[#627D98] block mb-1">Email</span>
              <span className="font-bold text-base">{vm.client?.email || 'N/A'}</span>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 h-full">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Bienvenido de nuevo,</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter">{vm.client?.name || 'Cliente'}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-[#0A2540] text-white rounded-[32px] p-12 flex flex-col justify-between h-[300px]">
          <div>
            <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Balance Disponible</span>
            <div className="text-6xl font-black mt-4 tracking-tighter">$0.00</div>
          </div>
          <div className="flex gap-4">
            <Button variant="primary" size="lg" className="gap-3 px-8">
              <ArrowUpRight className="w-5 h-5" /> Transferir
            </Button>
            <Button variant="secondary" size="lg" className="gap-3 px-8">
              <ArrowDownLeft className="w-5 h-5" /> Depositar
            </Button>
          </div>
        </div>

        <Card className="flex flex-col justify-between h-[300px] p-8">
          <div>
            <div className="w-16 h-16 rounded-3xl bg-[#E8F0FE] text-[#0066FF] flex items-center justify-center mb-6">
              <BotMessageSquare className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-xl mb-2">Asistido por agentes</h3>
            <p className="text-sm text-[#627D98] leading-relaxed">Tu gestión financiera potenciada por IA autónoma.</p>
          </div>
          <div className="pt-6 border-t border-[#E2E8F0] flex items-center justify-between">
            <span className="text-sm font-bold">{vm.client?.mfaEnabled ? 'Seguridad Activa' : 'Seguridad Pendiente'}</span>
            <Button variant="ghost" size="md"><Lock className="w-5 h-5" /></Button>
          </div>
        </Card>
      </div>
    </div>
  );
}