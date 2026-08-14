import { useClientVM } from '../viewmodels/client/useClientVM';
import { ClientHomeView } from './client/ClientHomeView';
import { ClientProfileView } from './client/ClientProfileView';
import { ClientLoansView } from './client/ClientLoansView';
import { LoadingScreen } from '../components/LoadingScreen';

interface ClientViewProps {
  activeTab?: 'home' | 'loans' | 'profile';
  setActiveTab?: (tab: 'home' | 'loans' | 'profile') => void;
}

export function ClientView({ activeTab = 'home', setActiveTab }: ClientViewProps) {
  const vm = useClientVM();

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando" />;
  }

  switch (activeTab) {
    case 'profile':
      return <ClientProfileView />;
    case 'loans':
      return <ClientLoansView />;
    case 'home':
    default:
      return <ClientHomeView client={vm.client} setActiveTab={setActiveTab} />;
  }
}