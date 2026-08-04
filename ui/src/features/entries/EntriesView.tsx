// src/features/entries/EntriesView.tsx
import { useAccountStore } from '../../store/useAccountStore';
import type { OperationType } from '../../core/models/Entry';
import { Search, Percent } from 'lucide-react';

export default function EntriesView() {
  const { entries } = useAccountStore();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', { 
      style: 'currency', 
      currency: currency,
      minimumFractionDigits: 2 
    }).format(amount);
  };

  const isIncome = (type: OperationType) => type === 'DEPOSIT';

  return (
    <div className="flex flex-col min-h-full pb-8">
      <header className="px-6 pt-16 pb-4 sticky top-0 bg-bg-base/90 backdrop-blur-xl z-20">
        <div className="w-8 h-1 bg-border-subtle rounded-full mx-auto mb-6" />
        <h1 className="text-[28px] font-bold tracking-tight text-text-primary mb-8">Transactions</h1>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
          <input
            type="text"
            className="w-full pl-12 pr-4 py-3 bg-bg-elevated border-none rounded-xl text-[15px] text-text-primary placeholder-text-secondary focus:outline-none focus:ring-1 focus:ring-border-subtle transition-all"
            placeholder="Search transactions"
          />
        </div>
      </header>

      <div className="px-6 py-4">
        <h3 className="text-[17px] font-bold text-text-primary mb-6">This month</h3>
        
        <div className="flex flex-col gap-6">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-center justify-between cursor-pointer active:opacity-70 transition-opacity">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${isIncome(entry.operationType) ? 'bg-accent/20 text-accent' : 'bg-bg-elevated text-text-secondary'}`}>
                  {isIncome(entry.operationType) ? (
                    <Percent className="w-5 h-5" />
                  ) : (
                    <span className="font-semibold text-[15px]">
                      {entry.concept.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold text-[15px] text-text-primary truncate max-w-[190px]">
                    {entry.concept}
                  </span>
                  <span className="text-[13px] text-text-secondary mt-0.5">
                    {new Date(entry.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} · {entry.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold text-[17px] tracking-tight ${isIncome(entry.operationType) ? 'text-success' : 'text-text-primary'}`}>
                  {isIncome(entry.operationType) ? '+' : ''}{formatCurrency(entry.amount, entry.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}