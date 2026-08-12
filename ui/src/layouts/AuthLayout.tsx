import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-[#F0F4F9] p-6">
      <div className="grid w-full max-w-7xl h-[680px] grid-cols-1 md:grid-cols-2 rounded-[40px] overflow-hidden bg-white border border-[#E2E8F0] shadow-xl">
        <div className="bg-[#0A2540] p-16 text-white flex flex-col justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0066FF] flex items-center justify-center font-black text-xl">BS</div>
            <span className="font-black text-2xl tracking-tight">BankSystem</span>
          </div>

          <div className="space-y-6 my-auto">
            <h2 className="text-5xl font-black leading-tight tracking-tighter">
              Tu banca.<br />Sin complicaciones.
            </h2>
            <p className="text-lg text-[#627D98] leading-relaxed max-w-lg">
              Gestiona tu dinero con rendimiento en tiempo real.
            </p>
          </div>

          <div className="inline-flex items-center gap-3 text-sm font-semibold bg-white/10 border border-white/10 px-5 py-3 rounded-2xl shadow-inner text-[#00F0FF] w-fit">
            <Bot className="w-5 h-5 text-[#00F0FF]" /> 
            <span className="text-white">Asistido por agentes autónomos</span>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}