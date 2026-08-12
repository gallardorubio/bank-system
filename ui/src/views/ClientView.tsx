import { useClientVM } from '../viewmodels/useClientVM';
import { ClientHomeView } from './client/ClientHomeView';
import { ClientProfileView } from './client/ClientProfileView';
import { ClientOperationsView } from './client/ClientOperationsView';

interface ClientViewProps {
  activeTab?: 'home' | 'operations' | 'profile';
}

export function ClientView({ activeTab = 'home' }: ClientViewProps) {
  const vm = useClientVM();

  if (vm.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm font-bold uppercase tracking-widest text-[#0066FF] animate-pulse">
          Cargando plataforma...
        </span>
      </div>
    );
  }

  switch (activeTab) {
    case 'profile':
      return <ClientProfileView />;
    case 'operations':
      return <ClientOperationsView />;
    case 'home':
    default:
      return <ClientHomeView client={vm.client} bankAccount={vm.bankAccount} />;
  }
}