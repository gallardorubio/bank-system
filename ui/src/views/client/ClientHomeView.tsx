import type { ClientResponse, BankAccountResponse } from '../../api/model';
import { Button } from '../../components/Button';
import { ArrowUpRight, ArrowDownLeft } from 'lucide-react';

interface ClientHomeViewProps {
  client?: ClientResponse;
  bankAccount?: BankAccountResponse;
}

export function ClientHomeView({ client, bankAccount }: ClientHomeViewProps) {
  const currency = bankAccount?.currency || 'EUR';
  const balanceValue = typeof bankAccount?.balance === 'number' 
    ? bankAccount.balance.toFixed(2) 
    : '0.00';

  return (
    <div className="flex flex-col gap-10 h-full max-w-5xl">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Bienvenido de nuevo,</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">{client?.name || 'Cliente'}</h1>
      </div>

      <div className="bg-[#0A2540] text-white rounded-[32px] p-12 flex flex-col justify-between min-h-[320px] shadow-lg">
        <div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Balance Disponible</span>
            {bankAccount?.id && (
              <span className="text-xs font-mono bg-white/10 text-white/70 px-3 py-1.5 rounded-xl">
                ID: {bankAccount.id}
              </span>
            )}
          </div>
          <div className="text-6xl font-black mt-6 tracking-tighter flex items-baseline gap-3">
            <span>{balanceValue}</span>
            <span className="text-3xl font-bold text-[#0066FF]">{currency}</span>
          </div>
        </div>

        <div className="flex gap-8 mt-8">
          <Button variant="primary" size="lg" className="gap-3 px-8 py-4 text-base font-bold shadow-md cursor-pointer">
            <ArrowUpRight className="w-5 h-5" /> Transferir
          </Button>
          <Button variant="secondary" size="lg" className="gap-3 px-8 py-4 text-base font-bold cursor-pointer">
            <ArrowDownLeft className="w-5 h-5" /> Depositar
          </Button>
        </div>
      </div>
    </div>
  );
}