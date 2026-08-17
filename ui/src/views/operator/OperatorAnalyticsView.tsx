import { useOperatorAnalyticsVM } from '../../viewmodels/operator/useAnalyticsVM';
import { Card } from '../../components/Card';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Users, Landmark, Wallet, TrendingUp, ShieldCheck, Activity } from 'lucide-react';

export function OperatorAnalyticsView() {
  const { analytics, isLoading, error, formatAmount, reserveCoverageRatio } = useOperatorAnalyticsVM();

  if (isLoading) {
    return <LoadingScreen label="Cargando" />;
  }

  const vault = analytics?.vaultBalance ?? 0;
  const clientBalance = analytics?.totalClientBalance ?? 0;
  const accounts = analytics?.totalClientBankAccount ?? 0;
  const avgBalance = analytics?.averageClientBalance ?? 0;

  const totalLiquidity = vault + clientBalance;
  const clientRatio = totalLiquidity > 0 ? (clientBalance / totalLiquidity) * 100 : 0;

  // Métricas financieras reales
  const cashRatio = clientBalance > 0 ? (vault / clientBalance) * 100 : 0;
  const liquidityGap = vault - clientBalance;

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">
          Panel de Control
        </span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">
          Estadísticas
        </h1>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-[#E8F0FE] text-[#0A2540] text-sm font-bold border border-[#E2E8F0]">
          {error}
        </div>
      )}

      {/* KPI GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Cuentas Clientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-4xl font-black text-[#0A2540] tracking-tight">
              {accounts}
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Total de Reservas
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-black text-[#0A2540] tracking-tight truncate block">
              {formatAmount(vault)} <span className="text-xl font-bold text-[#627D98]">EUR</span>
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Balance Total Clientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-black text-[#0A2540] tracking-tight truncate block">
              {formatAmount(clientBalance)} <span className="text-xl font-bold text-[#627D98]">EUR</span>
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between border border-[#E2E8F0]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#627D98]">
              Balance Promedio clientes
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-6">
            <span className="text-3xl font-black text-[#0A2540] tracking-tight truncate block">
              {formatAmount(avgBalance)} <span className="text-xl font-bold text-[#627D98]">EUR</span>
            </span>
          </div>
        </Card>
      </div>

      {/* CORE FINANCIAL OVERVIEW & COEFICIENTE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Panel Principal: Solvencia */}
        <div className="lg:col-span-7 bg-[#0A2540] text-white rounded-[36px] p-9 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-[#0066FF]/25 rounded-full blur-3xl pointer-events-none" />

          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold bg-white/10 text-white px-4 py-2 rounded-xl uppercase tracking-widest border border-white/10">
                Solvencia de Reservas
              </span>
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>

            <div className="mt-8">
              <span className="text-xs font-bold uppercase tracking-widest text-[#627D98] block mb-1">
                Ratio de Cobertura sobre Activos
              </span>
              <div className="text-7xl font-black tracking-tighter text-white">
                {reserveCoverageRatio.toFixed(2)}%
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="w-full h-3.5 bg-white/10 rounded-full overflow-hidden flex">
                <div
                  className="h-full bg-[#0066FF] transition-all duration-500"
                  style={{ width: `${reserveCoverageRatio}%` }}
                />
                <div
                  className="h-full bg-white/20 transition-all duration-500"
                  style={{ width: `${clientRatio}%` }}
                />
              </div>

              <div className="flex justify-between text-xs font-bold pt-1">
                <span className="text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0066FF]" />
                  Reservas ({reserveCoverageRatio.toFixed(2)}%)
                </span>
                <span className="text-slate-300 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-white/30" />
                  Clientes ({clientRatio.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          <div className="mt-10 pt-5 border-t border-white/10 flex justify-between items-center text-sm font-semibold">
            <span className="text-[#627D98]">Fondo total del sistema</span>
            <span className="text-xl font-black text-white">
              {formatAmount(totalLiquidity)} EUR
            </span>
          </div>
        </div>

        {/* Card Lateral: Coeficiente de Caja y Cobertura de Pasivos */}
        <Card className="lg:col-span-5 p-8 flex flex-col justify-between border border-[#E2E8F0] rounded-[36px] bg-white">
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold uppercase tracking-widest text-[#627D98]">
                Liquidez Inmediata
              </span>
              <div className="w-9 h-9 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
                <Activity className="w-5 h-5" />
              </div>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#627D98] block mb-1">
                Coeficiente de Caja
              </span>
              <div className="text-6xl font-black tracking-tight text-[#0A2540]">
                {cashRatio.toFixed(2)}%
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-6 mt-6 border-t border-[#E2E8F0]">
            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#627D98]">Brecha neta de reservas</span>
              <span className="text-[#0A2540]">{formatAmount(liquidityGap)} EUR</span>
            </div>

            <div className="flex justify-between items-center text-sm font-bold">
              <span className="text-[#627D98]">Capacidad retirada inmediata</span>
              <span className="text-[#0066FF]">{Math.min(100, cashRatio).toFixed(2)}%</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}