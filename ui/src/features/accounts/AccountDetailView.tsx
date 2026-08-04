// src/features/accounts/AccountDetailView.tsx
import { Copy, Download, FileText, ArrowLeft, Percent } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AccountDetailView() {
  const formatCurrency = (amount: number) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount);

  return (
    <div className="flex flex-col min-h-full pb-10">
      <header className="px-6 pt-6 pb-8 bg-bg-surface border-b border-border-subtle sticky top-0 z-20 backdrop-blur-2xl bg-opacity-80">
        <div className="flex justify-between items-center mb-8">
          <Link to="/" className="p-2 -ml-2 bg-transparent hover:bg-bg-elevated rounded-full transition-colors cursor-pointer"><ArrowLeft className="w-6 h-6" /></Link>
          <button className="p-2.5 bg-bg-elevated hover:bg-white/10 rounded-full text-text-primary transition-colors cursor-pointer"><Copy className="w-5 h-5" /></button>
        </div>
        <p className="text-[15px] font-medium text-text-secondary mb-2">Cuenta *2816</p>
        <h2 className="text-[48px] font-bold tracking-tighter leading-none">{formatCurrency(14502.50)}</h2>
      </header>

      <div className="px-6 py-8 space-y-8">
         {/* Datos de cuenta */}
        <section>
          <h3 className="text-[14px] font-bold text-text-secondary uppercase tracking-wider mb-4 pl-2">Datos bancarios</h3>
          <div className="bg-bg-surface border border-border-subtle rounded-[24px] p-6 space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-[15px] font-medium">IBAN</span>
              <span className="font-mono text-[14px] font-bold tracking-tight">ES14 1234 5678 9012 3456</span>
            </div>
            <div className="w-full h-[1px] bg-border-subtle" />
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-[15px] font-medium">BIC / SWIFT</span>
              <span className="font-mono text-[14px] font-bold tracking-tight">CECAESMMXXX</span>
            </div>
            <div className="w-full h-[1px] bg-border-subtle" />
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-[15px] font-medium">Titulares</span>
              <span className="text-[15px] font-bold">Álvaro Gallardo</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4">
            <button className="py-4 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold hover:bg-bg-elevated active:scale-95 transition-all cursor-pointer">
              <Download className="w-5 h-5" /> Descargar CSV
            </button>
            <button className="py-4 bg-bg-surface border border-border-subtle rounded-2xl flex items-center justify-center gap-2 text-[14px] font-bold hover:bg-bg-elevated active:scale-95 transition-all cursor-pointer">
              <FileText className="w-5 h-5" /> Certificado
            </button>
          </div>
        </section>

        {/* Movimientos */}
        <section>
           <h3 className="text-[14px] font-bold text-text-secondary uppercase tracking-wider mb-4 pl-2">Movimientos</h3>
           <div className="flex flex-col">
             {/* Mock Item Ingreso */}
             <div className="flex items-center justify-between p-4 -mx-4 rounded-2xl hover:bg-bg-surface cursor-pointer transition-colors group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-success/10 text-success group-hover:bg-success group-hover:text-black transition-colors">
                   <Percent className="w-5 h-5" />
                 </div>
                 <div className="flex flex-col">
                   <span className="font-bold text-[16px] text-text-primary">Nómina Empresa S.A.</span>
                   <span className="text-[14px] text-text-secondary mt-0.5">28 Abr · Transferencia</span>
                 </div>
               </div>
               <div className="text-right">
                 <span className="font-bold text-[17px] tracking-tight text-success">
                   +1.200,00 €
                 </span>
               </div>
             </div>

             {/* Mock Item Gasto */}
             <div className="flex items-center justify-between p-4 -mx-4 rounded-2xl hover:bg-bg-surface cursor-pointer transition-colors group">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-bg-elevated text-text-secondary group-hover:bg-white group-hover:text-black transition-colors">
                   <span className="font-bold text-[16px]">B</span>
                 </div>
                 <div className="flex flex-col">
                   <span className="font-bold text-[16px] text-text-primary">Bizum a María</span>
                   <span className="text-[14px] text-text-secondary mt-0.5">25 Abr · Bizum</span>
                 </div>
               </div>
               <div className="text-right">
                 <span className="font-bold text-[17px] tracking-tight text-text-primary">
                   -15,00 €
                 </span>
               </div>
             </div>
           </div>
        </section>
      </div>
    </div>
  );
}