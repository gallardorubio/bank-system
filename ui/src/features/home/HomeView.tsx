// src/features/home/HomeView.tsx
import { Send, FileSpreadsheet, Phone, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function HomeView() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="flex flex-col min-h-full">
      
      {/* Saldo Principal */}
      <section className="px-6 pt-6 pb-6">
         <p className="text-[15px] font-medium text-text-secondary mb-2">Patrimonio total</p>
         <h1 className="text-[52px] leading-[1.1] font-bold tracking-tighter text-white">
            {formatCurrency(14502.50)}
         </h1>
      </section>

      {/* Botones de acción rápida - Estilo Azul Bancario */}
      <section className="px-6 grid grid-cols-3 gap-3 mb-10">
        <Link to="/transfer" className="interactive-item flex flex-col items-center justify-center gap-3 py-5 rounded-3xl bg-accent text-white shadow-lg shadow-accent/20">
          <Send className="w-6 h-6" strokeWidth={2.5} />
          <span className="text-[12px] font-bold tracking-wide uppercase">Transferir</span>
        </Link>
        <button className="interactive-item flex flex-col items-center justify-center gap-3 py-5 rounded-3xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-white">
          <FileSpreadsheet className="w-6 h-6" />
          <span className="text-[12px] font-bold tracking-wide uppercase">Recibos</span>
        </button>
        <button className="interactive-item flex flex-col items-center justify-center gap-3 py-5 rounded-3xl bg-bg-surface border border-border-subtle text-text-secondary hover:text-white">
          <Phone className="w-6 h-6" />
          <span className="text-[12px] font-bold tracking-wide uppercase">Contactar</span>
        </button>
      </section>

      {/* Cuentas */}
      <section className="px-6">
        <div className="flex justify-between items-center mb-5">
           <h2 className="text-[20px] font-bold tracking-tight text-white">Cuentas</h2>
        </div>
        
        <div className="interactive-item bg-bg-surface border border-border-subtle rounded-[32px] p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 blur-[50px] rounded-full transition-opacity group-hover:bg-accent/10" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-xl bg-bg-elevated border border-border-subtle flex items-center justify-center font-bold text-sm text-accent">C1</div>
               <span className="text-[16px] font-bold text-white">Cuenta *2816</span>
            </div>
            <span className="px-3 py-1 bg-accent/10 text-accent rounded-full text-[11px] font-bold uppercase tracking-wider">Principal</span>
          </div>
          
          <div className="mb-8 relative z-10">
            <h3 className="text-[32px] font-bold tracking-tight text-white">{formatCurrency(14502.50)}</h3>
          </div>

          <div className="space-y-4 relative z-10">
            <div className="flex justify-between items-center bg-bg-base/50 p-3 rounded-2xl">
               <span className="text-[14px] font-medium text-text-primary">Nómina Empresa S.A.</span>
               <span className="text-[14px] font-bold text-success">+1.200,00 €</span>
            </div>
            <div className="flex justify-between items-center bg-bg-base/50 p-3 rounded-2xl">
               <span className="text-[14px] font-medium text-text-primary">Bizum a María</span>
               <span className="text-[14px] font-bold text-white">-15,00 €</span>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle relative z-10">
            <Link to="/accounts/2816" className="flex items-center justify-between text-[14px] font-bold text-accent group-hover:text-accent/80 transition-colors">
              Todos los movimientos
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}