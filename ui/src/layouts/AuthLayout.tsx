import type { ReactNode } from 'react';
import { Bot } from 'lucide-react';

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#F0F4F9] p-3 sm:p-6">
      <div className="grid w-full max-w-7xl overflow-hidden rounded-[28px] border border-[#E2E8F0] bg-white shadow-xl md:h-[680px] md:grid-cols-2 md:rounded-[40px]">
        <div className="flex flex-col justify-between bg-[#0A2540] p-6 text-white sm:p-8 md:p-16">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0066FF] flex items-center justify-center font-black text-xl">BS</div>
            <span className="font-black text-2xl tracking-tight">BankSystem</span>
          </div>

          <div className="my-auto space-y-6 py-8 md:py-0">
            <h2 className="text-3xl font-black leading-tight tracking-tighter sm:text-4xl md:text-5xl">
              Tu banca.<br />Sin complicaciones.
            </h2>
            <p className="max-w-lg text-base leading-relaxed text-[#627D98] md:text-lg">
              Gestiona tu dinero con rendimiento en tiempo real.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-[#00F0FF] shadow-inner md:px-5">
            <Bot className="w-5 h-5 text-[#00F0FF]" />
            <span className="text-white">Asistido por agentes autónomos</span>
          </div>
        </div>

        <div className="flex min-h-[280px] overflow-y-auto bg-white md:h-full md:min-h-0">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}