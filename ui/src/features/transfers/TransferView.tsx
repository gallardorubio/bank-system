// src/features/transfers/TransferView.tsx
import { Plus, Landmark, Percent, ArrowRight } from 'lucide-react';

export default function TransferView() {
  const recentContacts = [
    { id: 1, name: 'PayPal (Europe) Sarl et...', bank: 'Barclays ·· 0301', initials: 'P' },
    { id: 2, name: 'ALVARO GALLARDO RUBIO', bank: 'Banco Sabadell ·· 9243', initials: 'A' },
    { id: 3, name: 'ALVARO GALLARDO RUBIO', bank: 'CaixaBank ·· 1792', initials: 'A' },
    { id: 4, name: 'Interactive Brokers Ireland...', bank: 'J.P. Morgan ·· 2815', initials: 'I' },
  ];

  return (
    <div className="flex flex-col min-h-full pb-8">
      <header className="px-6 pt-6 pb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-white mb-10">Transferencias</h1>
        
        <div className="flex flex-col gap-4">
          <button className="interactive-item flex items-center gap-4 bg-bg-surface border border-border-subtle p-5 rounded-[24px]">
            <div className="w-12 h-12 rounded-full bg-accent text-white flex items-center justify-center shrink-0">
              <Plus className="w-6 h-6" strokeWidth={2.5} />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[16px] text-white">Añadir dinero</span>
              <span className="text-[13px] text-text-secondary">Ingresa fondos en tu cuenta</span>
            </div>
          </button>
          
          <button className="interactive-item flex items-center gap-4 bg-bg-surface border border-border-subtle p-5 rounded-[24px]">
            <div className="w-12 h-12 rounded-full bg-bg-elevated text-accent flex items-center justify-center shrink-0">
              <Landmark className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[16px] text-white">Transferencia nacional</span>
              <span className="text-[13px] text-text-secondary">Envía dinero a un IBAN nuevo</span>
            </div>
          </button>

          <button className="interactive-item flex items-center gap-4 bg-bg-surface border border-border-subtle p-5 rounded-[24px]">
            <div className="w-12 h-12 rounded-full bg-bg-elevated text-accent flex items-center justify-center shrink-0">
              <Percent className="w-5 h-5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-bold text-[16px] text-white">Contacto Bizum</span>
              <span className="text-[13px] text-text-secondary">Envío instantáneo por teléfono</span>
            </div>
          </button>
        </div>
      </header>

      <section className="px-6 mt-2">
        <h3 className="text-[15px] font-bold text-white mb-5 pl-2">Recientes</h3>
        <div className="flex flex-col gap-2">
          {recentContacts.map((contact) => (
            <div key={contact.id} className="interactive-item flex items-center justify-between p-4 bg-bg-surface border border-border-subtle rounded-2xl group">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-bg-elevated flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-[15px]">
                    {contact.initials}
                  </span>
                </div>
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-bold text-[15px] text-white truncate">
                    {contact.name}
                  </span>
                  <span className="text-[13px] text-text-secondary truncate mt-0.5">
                    {contact.bank}
                  </span>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-text-secondary group-hover:text-accent transition-colors" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}