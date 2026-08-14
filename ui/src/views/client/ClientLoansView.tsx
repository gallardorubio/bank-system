import { useState } from 'react';
import { useLoansVM } from '../../viewmodels/client/useLoansVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { Landmark, Loader2, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, X } from 'lucide-react';
import type { LoanResponse } from '../../api/model';

export function ClientLoansView() {
  const vm = useLoansVM();
  const [selectedLoan, setSelectedLoan] = useState<LoanResponse | null>(null);

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando" />;
  }

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

  const handleNumericInput = (setter: (val: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val === '' || /^\d*\.?\d*$/.test(val)) {
      setter(val);
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs">COMPLETED</span>;
      case 'APPROVED':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs">APPROVED</span>;
      case 'PENDING':
      case 'ESCALATED':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs">{status}</span>;
      case 'DENIED':
      case 'REJECTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-400 font-semibold text-xs">{status}</span>;
      default:
        return <span className="inline-flex items-center px-3 py-1 rounded-lg bg-slate-100 text-slate-500 font-semibold text-xs">{status || 'PENDING'}</span>;
    }
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Financiación</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">Préstamos</h1>
      </div>

      {/* SIMULADOR FINTECH GAMIFICADO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
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

        <div className="lg:col-span-5 bg-[#0066FF] text-white rounded-[36px] p-10 flex flex-col justify-between shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-8 translate-y-8 w-56 h-56 bg-white/10 rounded-full blur-3xl pointer-events-none" />
          
          <div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold bg-[#0A2540] text-white px-3.5 py-1.5 rounded-xl uppercase tracking-widest shadow-sm">Cuota estimada</span>
              <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-white backdrop-blur-md shadow-sm">
                <Landmark className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="text-7xl font-black mt-6 tracking-tighter text-white flex items-baseline gap-2.5">
              <span className="leading-none">{isFinite(estimatedInstallment) ? estimatedInstallment.toFixed(2) : '0.00'}</span> 
              <span className="text-3xl font-black text-[#0A2540]">EUR</span>
            </div>
          </div>

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

      {/* HISTORIAL DE PRÉSTAMOS CON ESPACIO INFERIOR ADECUADO (pb-16 / mb-24) */}
      <Card className="p-8 w-full shadow-sm mb-24">
        <h3 className="text-xl font-black text-[#0A2540] mb-6">Préstamos</h3>
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
              <tbody className="divide-y divide-[#F1F5F9] text-base font-semibold text-[#627D98]">
                {vm.loans.map((loan) => (
                  <tr 
                    key={loan.id} 
                    onClick={() => setSelectedLoan(loan)}
                    className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 text-sm font-medium text-[#627D98]">
                      {loan.createdAt ? new Date(loan.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-4 font-bold text-base text-[#627D98]">{loan.amount} EUR</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#627D98]">{loan.termPeriods} cuotas</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#627D98]">{loan.installmentFrequency}</td>
                    <td className="py-4 px-4 text-sm font-medium text-[#627D98]">{loan.interestRate}%</td>
                    <td className="py-4 px-4">
                      {getStatusBadge(loan.status)}
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

      {/* MODAL COMPLETO DE DETALLES DEL PRÉSTAMO */}
      {selectedLoan && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Detalles del Préstamo
            </span>
            <button 
              onClick={() => setSelectedLoan(null)}
              className="absolute top-0 right-2 p-3 rounded-full hover:bg-[#F0F4F9] text-[#0A2540] transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-10 h-10" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto gap-8 pt-16 pb-12">
            <div className="w-full space-y-8">
              <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6">
                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Plazo / Frecuencia</span>
                  <span className="text-xl font-bold text-[#627D98]">{selectedLoan.termPeriods ?? '-'} cuotas ({selectedLoan.installmentFrequency ?? '-'})</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tasa de Interés</span>
                  <span className="text-xl font-bold text-[#627D98]">{selectedLoan.interestRate !== undefined ? `${selectedLoan.interestRate}% TIN` : '-'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuotas Pagadas</span>
                  <span className="text-xl font-bold text-[#627D98]">{selectedLoan.installmentsPaid ?? 0} de {selectedLoan.termPeriods ?? 0}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Monto Pagado</span>
                  <span className="text-2xl font-bold text-[#627D98]">{selectedLoan.paidAmount !== undefined && selectedLoan.paidAmount !== null ? `${Number(selectedLoan.paidAmount).toFixed(2)} EUR` : '0.00 EUR'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Importe Próxima Cuota</span>
                  <span className="text-2xl font-bold text-[#627D98]">{selectedLoan.nextInstallmentAmount !== undefined && selectedLoan.nextInstallmentAmount !== null ? `${Number(selectedLoan.nextInstallmentAmount).toFixed(2)} EUR` : '-'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha Próxima Cuota</span>
                  <span className="text-lg font-bold text-[#627D98]">{selectedLoan.nextInstallmentDate ? new Date(selectedLoan.nextInstallmentDate).toLocaleDateString() : '-'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha Vencimiento Final</span>
                  <span className="text-lg font-bold text-[#627D98]">{selectedLoan.maturityDate ? new Date(selectedLoan.maturityDate).toLocaleDateString() : '-'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha de Creación</span>
                  <span className="text-lg font-bold text-[#627D98]">{selectedLoan.createdAt ? new Date(selectedLoan.createdAt).toLocaleString() : '-'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Monto del Préstamo</span>
                  <span className="text-4xl font-black text-[#0A2540]">
                    {selectedLoan.amount !== undefined && selectedLoan.amount !== null ? `${Number(selectedLoan.amount).toFixed(2)} EUR` : '-'}
                  </span>
                </div>
              </div>

              {/* HISTORIAL DE ESTADOS */}
              {selectedLoan.statusHistory && selectedLoan.statusHistory.length > 0 && (
                <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6 text-left">
                  <span className="text-base font-bold text-[#627D98] uppercase tracking-wider block mb-4">Historial de Estados</span>
                  
                  {selectedLoan.statusHistory.length === 1 ? (
                    <div className="flex flex-col gap-1.5 pl-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-4 h-4 rounded-full bg-[#0066FF] border-4 border-white shadow-md shrink-0" />
                          <span className="font-black text-xl text-[#0A2540]">{selectedLoan.statusHistory[0].status}</span>
                        </div>
                        <span className="text-sm font-bold text-[#627D98]">
                          {selectedLoan.statusHistory[0].createdAt ? new Date(selectedLoan.statusHistory[0].createdAt).toLocaleString() : ''}
                        </span>
                      </div>
                      {selectedLoan.statusHistory[0].reason && (
                        <p className="text-sm text-slate-600 font-semibold pl-8">{selectedLoan.statusHistory[0].reason}</p>
                      )}
                    </div>
                  ) : (
                    <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-1 before:bg-slate-300">
                      {selectedLoan.statusHistory.map((phase: any, index: number) => (
                        <div key={index} className="relative flex flex-col gap-1.5">
                          <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-[#0066FF] border-4 border-white shadow-md" />
                          <div className="flex items-center justify-between">
                            <span className="font-black text-xl text-[#0A2540]">{phase.status}</span>
                            <span className="text-sm font-bold text-[#627D98]">
                              {phase.createdAt ? new Date(phase.createdAt).toLocaleString() : ''}
                            </span>
                          </div>
                          {phase.reason && (
                            <p className="text-sm text-slate-600 font-semibold">{phase.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="w-full pb-4"></div>
        </div>
      )}
    </div>
  );
}