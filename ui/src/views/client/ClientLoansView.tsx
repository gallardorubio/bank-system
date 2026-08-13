import { useLoansVM } from '../../viewmodels/useLoansVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Landmark, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Calculator } from 'lucide-react';

export function ClientLoansView() {
  const vm = useLoansVM();

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando" />;
  }

  // Lógica exacta de cálculo idéntica al backend Java
  const principal = Number(vm.amount) || 0;
  const periods = Number(vm.termPeriods) || 12;
  const annualRate = Number(vm.interestRate) || 0;

  const periodsPerYear = vm.installmentFrequency === 'ANNUAL' ? 1 : vm.installmentFrequency === 'SEMI_ANNUAL' ? 2 : 12;
  
  const annualRateDecimal = annualRate / 100;
  const years = periods / periodsPerYear;
  
  const totalInterest = principal * annualRateDecimal * years;
  const totalToPay = principal + totalInterest;
  const estimatedInstallment = periods > 0 ? totalToPay / periods : 0;

  const daysPerPeriod = vm.installmentFrequency === 'ANNUAL' ? 365 : vm.installmentFrequency === 'SEMI_ANNUAL' ? 182 : 30;
  const totalDays = daysPerPeriod * periods;
  const maturityDate = new Date();
  maturityDate.setDate(maturityDate.getDate() + totalDays);

  const interestPercentage = totalToPay > 0 ? (totalInterest / totalToPay) * 100 : 0;

  const amountPercent = Math.min(100, Math.max(0, ((principal - 500) / (100000 - 500)) * 100));
  const periodsPercent = Math.min(100, Math.max(0, ((periods - 1) / (360 - 1)) * 100));

  // Validadores para evitar letras, signos negativos o símbolos extraños en inputs numéricos
  const handleNumericInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setter(val);
    }
  };

  return (
    <div className="flex flex-col gap-10 h-full w-full pb-12">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Financiación</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">Préstamos</h1>
      </div>

      {/* SIMULADOR FINTECH GAMIFICADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* PANEL DE CONTROL (IZQUIERDA) */}
        <Card className="lg:col-span-7 p-10 flex flex-col justify-between shadow-sm border border-[#E2E8F0] rounded-[36px]">
          <div>
            {vm.successMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {vm.successMsg}
              </div>
            )}
            {vm.errorMsg && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" /> {vm.errorMsg}
              </div>
            )}

            <form onSubmit={vm.handleCreateLoan} id="loan-form" className="space-y-6">
              {/* MONTO */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#627D98] uppercase tracking-wider">Cantidad solicitada</label>
                  <span className="text-lg font-black text-[#0A2540]">{principal} EUR</span>
                </div>
                <div className="relative flex items-center py-2">
                  <div className="absolute w-full h-2.5 bg-[#E2E8F0] rounded-lg overflow-hidden pointer-events-none">
                    <div className="h-full bg-[#0066FF] transition-all duration-75" style={{ width: `${amountPercent}%` }} />
                  </div>
                  <input 
                    type="range"
                    min="500"
                    max="100000"
                    step="500"
                    value={principal || 500}
                    onChange={e => vm.setAmount(e.target.value)}
                    className="w-full relative z-10 accent-[#0066FF] cursor-pointer h-2.5 bg-transparent rounded-lg appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-xl [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0066FF] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>
                <input 
                  type="text"
                  inputMode="decimal"
                  required
                  value={vm.amount}
                  onChange={handleNumericInput(vm.setAmount)}
                  className="w-full h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-bold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]"
                  placeholder="Ej: 10000"
                />
              </div>

              {/* PLAZOS / CUOTAS */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#627D98] uppercase tracking-wider">Plazo de amortización</label>
                  <span className="text-lg font-black text-[#0A2540]">{periods} cuotas</span>
                </div>
                <div className="relative flex items-center py-2">
                  <div className="absolute w-full h-2.5 bg-[#E2E8F0] rounded-lg overflow-hidden pointer-events-none">
                    <div className="h-full bg-[#0066FF] transition-all duration-75" style={{ width: `${periodsPercent}%` }} />
                  </div>
                  <input 
                    type="range"
                    min="1"
                    max="360"
                    step="1"
                    value={periods}
                    onChange={e => vm.setTermPeriods(e.target.value)}
                    className="w-full relative z-10 accent-[#0066FF] cursor-pointer h-2.5 bg-transparent rounded-lg appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-xl [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0066FF] [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:shadow-md"
                  />
                </div>
                <input 
                  type="text"
                  inputMode="numeric"
                  required
                  value={vm.termPeriods}
                  onChange={e => {
                    const val = e.target.value;
                    if (val === '' || /^\d+$/.test(val)) {
                      vm.setTermPeriods(val);
                    }
                  }}
                  className="w-full h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-bold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]"
                />
              </div>

              {/* FRECUENCIA E INTERÉS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#627D98] uppercase tracking-wider">Frecuencia</label>
                  <select 
                    value={vm.installmentFrequency}
                    onChange={e => vm.setInstallmentFrequency(e.target.value as any)}
                    className="h-12 px-3 rounded-2xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-bold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF] cursor-pointer"
                  >
                    <option value="MONTHLY">Mensual</option>
                    <option value="SEMI_ANNUAL">Semestral</option>
                    <option value="ANNUAL">Anual</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#627D98] uppercase tracking-wider">Tasa Interés (% TIN)</label>
                  <input 
                    type="text"
                    inputMode="decimal"
                    required
                    value={vm.interestRate}
                    onChange={handleNumericInput(vm.setInterestRate)}
                    className="h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-bold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </form>
          </div>

          <div className="pt-8">
            <Button 
              form="loan-form" 
              type="submit" 
              disabled={vm.isSubmitting || principal <= 0} 
              className="w-full py-4 text-base font-bold shadow-lg cursor-pointer gap-2 rounded-2xl"
            >
              {vm.isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Solicitar Préstamo <ArrowRight className="w-5 h-5" /></>}
            </Button>
          </div>
        </Card>

        {/* PANEL DE RESULTADOS / RESUMEN VISUAL */}
        <div className="lg:col-span-5 bg-[#0066FF] text-white rounded-[36px] p-10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-[#0A2540] text-white px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">Cuota estimada</span>
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-md shadow-sm">
                <Landmark className="w-5 h-5 text-white" />
              </div>
            </div>
            {/* Dinero más grande en blanco con divisa --primary-dark */}
            <div className="text-7xl font-black mt-6 tracking-tighter text-white flex items-baseline gap-2.5">
              <span className="leading-none">{isFinite(estimatedInstallment) ? estimatedInstallment.toFixed(2) : '0.00'}</span> 
              <span className="text-3xl font-black text-[#0A2540]">EUR</span>
            </div>
          </div>

          {/* BARRA VISUAL DE PROPORCIÓN CON MÁS ESPACIO VERTICAL RESPECTO A LA CUOTA */}
          <div className="space-y-3 my-12">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-white/90">Capital ({principal} €)</span>
              <span className="text-[#0A2540] bg-white px-2 py-0.5 rounded font-black shadow-xs">Intereses ({isFinite(totalInterest) ? totalInterest.toFixed(2) : '0.00'} €)</span>
            </div>
            <div className="w-full h-3.5 bg-black/15 rounded-full overflow-hidden flex">
              <div className="bg-[#0A2540] h-full rounded-l-full transition-all duration-300" style={{ width: `${Math.max(10, 100 - interestPercentage)}%` }} title="Capital" />
              <div className="bg-white h-full rounded-r-full transition-all duration-300 shadow-sm" style={{ width: `${Math.min(90, interestPercentage)}%` }} title="Intereses" />
            </div>
          </div>

          {/* DETALLES DE LA SIMULACIÓN */}
          <div className="space-y-4 bg-[#0A2540] p-7 rounded-[28px] border border-white/10 text-left shadow-md">
            <div className="flex justify-between items-center pb-4 border-b border-white/10">
              <span className="text-sm font-bold text-white/80">Total a devolver:</span>
              <span className="text-xl font-black text-white">{isFinite(totalToPay) ? totalToPay.toFixed(2) : '0.00'} EUR</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-bold text-white/80">Fecha fin estimada:</span>
              <span className="text-lg font-black text-white">{maturityDate.toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-2.5 text-xs text-white font-bold">
            <div className="w-7 h-7 rounded-xl bg-[#0A2540] flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-black tracking-wide">Sin comisiones ocultas. Tipo fijo garantizado.</span>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE PRÉSTAMOS */}
      <Card className="p-8 w-full shadow-sm">
        <h3 className="text-xl font-black text-[#0A2540] mb-6">Tus préstamos activos e históricos</h3>
        {vm.loans.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#627D98] text-xs uppercase tracking-wider">
                  <th className="py-4 px-4 font-bold">Fecha</th>
                  <th className="py-4 px-4 font-bold">Monto</th>
                  <th className="py-4 px-4 font-bold">Plazos</th>
                  <th className="py-4 px-4 font-bold">Frecuencia</th>
                  <th className="py-4 px-4 font-bold">Interés</th>
                  <th className="py-4 px-4 font-bold">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F1F5F9] text-base font-semibold text-[#0A2540]">
                {vm.loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-[#F8FAFC] transition-colors">
                    <td className="py-4 px-4 text-[#627D98] text-base">
                      {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 font-black text-lg text-[#0A2540]">{loan.amount} EUR</td>
                    <td className="py-4 px-4 text-base">{loan.termPeriods} cuotas</td>
                    <td className="py-4 px-4 text-base">{loan.installmentFrequency}</td>
                    <td className="py-4 px-4 text-base">{loan.interestRate}%</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        loan.status === 'COMPLETED' || loan.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600' :
                        loan.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {loan.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-[#627D98] text-base font-semibold">
            No tienes préstamos registrados.
          </div>
        )}
      </Card>
    </div>
  );
}