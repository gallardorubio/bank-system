// src/features/loans/LoansView.tsx
import { Car, Zap, Home, GraduationCap, ArrowRight } from 'lucide-react';

export default function LoansView() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="flex flex-col gap-10 pb-10">
      
      {/* Consultar Préstamo Activo */}
      <section className="px-6 pt-6">
        <h2 className="text-[22px] font-bold tracking-tight mb-5 text-white">Préstamos activos</h2>
        <div className="interactive-item bg-bg-surface border border-border-subtle rounded-[32px] p-6 group">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h3 className="text-[18px] font-bold text-white">Préstamo Auto Eco</h3>
              <p className="text-[14px] text-text-secondary mt-1">Vto: 12 May 2028</p>
            </div>
            <div className="px-3 py-1.5 bg-success/10 text-success rounded-full text-[12px] font-bold uppercase tracking-wider border border-success/20">Al día</div>
          </div>

          <div className="mb-3 flex justify-between text-[14px] font-bold">
            <span className="text-white">Pagado: {formatCurrency(4500)}</span>
            <span className="text-text-secondary">Quedan: {formatCurrency(10500)}</span>
          </div>
          
          <div className="w-full h-3 bg-bg-elevated rounded-full overflow-hidden mb-8 border border-border-subtle">
            <div className="h-full bg-accent rounded-full relative" style={{ width: '30%' }}>
               <div className="absolute top-0 right-0 w-2 h-full bg-white/30" />
            </div>
          </div>

          <div className="p-5 bg-bg-base rounded-[20px] flex justify-between items-center mb-6 border border-border-subtle">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">Próxima cuota</span>
              <span className="font-bold text-[24px] tracking-tight text-white">315,50 €</span>
            </div>
            <div className="text-right">
               <span className="text-[14px] font-bold text-white block">01 Jun 2026</span>
               <span className="text-[13px] text-text-secondary">En 30 días</span>
            </div>
          </div>

          <button className="w-full py-4 bg-bg-elevated hover:bg-border-subtle text-white rounded-2xl font-bold text-[15px] transition-colors flex justify-center items-center gap-2">
            Ver detalles del préstamo <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Solicitar Nuevo Préstamo */}
      <section className="px-6">
        <h2 className="text-[22px] font-bold tracking-tight mb-2 text-white">Nuevo préstamo</h2>
        <p className="text-[15px] text-text-secondary mb-6 font-medium">¿Para qué proyecto lo necesitas?</p>
        
        <div className="grid grid-cols-2 gap-3 mb-8">
          <button className="interactive-item p-5 bg-bg-surface border border-border-subtle rounded-[24px] flex flex-col items-center gap-4">
            <div className="p-3 bg-bg-elevated rounded-full"><Car className="w-6 h-6 text-white" /></div>
            <span className="text-[15px] font-bold text-white">Vehículo</span>
          </button>
          <button className="interactive-item p-5 bg-accent/10 border border-accent/30 rounded-[24px] flex flex-col items-center gap-4">
            <div className="p-3 bg-accent/20 rounded-full"><Zap className="w-6 h-6 text-accent" /></div>
            <span className="text-[15px] font-bold text-accent">Auto Eco</span>
          </button>
          <button className="interactive-item p-5 bg-bg-surface border border-border-subtle rounded-[24px] flex flex-col items-center gap-4">
            <div className="p-3 bg-bg-elevated rounded-full"><Home className="w-6 h-6 text-white" /></div>
            <span className="text-[15px] font-bold text-white">Hogar</span>
          </button>
          <button className="interactive-item p-5 bg-bg-surface border border-border-subtle rounded-[24px] flex flex-col items-center gap-4">
            <div className="p-3 bg-bg-elevated rounded-full"><GraduationCap className="w-6 h-6 text-white" /></div>
            <span className="text-[15px] font-bold text-white">Estudios</span>
          </button>
        </div>

        <div className="bg-bg-surface border border-border-subtle rounded-[32px] p-6">
          <div className="mb-8">
            <div className="flex justify-between items-end mb-4">
              <span className="font-medium text-[15px] text-text-secondary">Importe deseado</span>
              <span className="font-bold text-[32px] tracking-tight leading-none text-white">15.000 €</span>
            </div>
            <input 
               type="range" 
               className="w-full accent-accent h-2 bg-bg-elevated rounded-lg appearance-none cursor-pointer" 
               min="1000" 
               max="50000" 
               defaultValue="15000" 
            />
            <div className="flex justify-between mt-3 text-[13px] font-bold text-text-secondary">
               <span>1.000 €</span>
               <span>50.000 €</span>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 border-t border-border-subtle pt-6 mb-8">
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">Cuota/mes</span>
              <span className="font-bold text-[18px] text-white">245 €</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">TIN</span>
              <span className="font-bold text-[18px] text-white">4,95%</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[12px] text-text-secondary font-bold uppercase tracking-wider">TAE</span>
              <span className="font-bold text-[18px] text-white">5,06%</span>
            </div>
          </div>

          <button className="interactive-item w-full bg-accent text-white font-extrabold text-[16px] py-4 rounded-2xl shadow-lg shadow-accent/20">
            Continuar solicitud
          </button>
        </div>
      </section>
    </div>
  );
}