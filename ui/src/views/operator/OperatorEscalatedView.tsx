import { useEscalatedVM } from '../../viewmodels/operator/useEscalatedVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { AlertCircle, Check, X, Loader2 } from 'lucide-react';

export function OperatorEscalatedView() {
  const vm = useEscalatedVM();

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando operaciones escaladas" />;
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">
          Resolución Manual
        </span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">
          Escalados
        </h1>
      </div>

      {vm.actionError && (
        <div className="p-4 rounded-2xl bg-[#E8F0FE] text-[#0A2540] text-sm font-bold border border-[#E2E8F0] flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-[#0066FF] shrink-0" />
          <span>{vm.actionError}</span>
        </div>
      )}

      {/* SELECTOR SUBTABS */}
      <div className="flex gap-3 border-b border-[#E2E8F0] pb-4">
        <button
          onClick={() => vm.setActiveSubTab('deposits')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            vm.activeSubTab === 'deposits'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'bg-white text-[#627D98] border border-[#E2E8F0] hover:bg-[#F0F4F9]'
          }`}
        >
          Depósitos ({vm.escalatedDeposits.length})
        </button>
        <button
          onClick={() => vm.setActiveSubTab('loans')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
            vm.activeSubTab === 'loans'
              ? 'bg-[#0A2540] text-white shadow-sm'
              : 'bg-white text-[#627D98] border border-[#E2E8F0] hover:bg-[#F0F4F9]'
          }`}
        >
          Préstamos ({vm.escalatedLoans.length})
        </button>
      </div>

      {vm.activeSubTab === 'deposits' ? (
        <Card className="overflow-hidden border border-[#E2E8F0] p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F4F9] text-[#627D98] text-xs font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-4 px-6">ID Operación</th>
                  <th className="py-4 px-6">Cuenta Origen</th>
                  <th className="py-4 px-6">Monto</th>
                  <th className="py-4 px-6">Fecha</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {vm.escalatedDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm font-bold text-[#627D98]">
                      No hay depósitos escalados pendientes
                    </td>
                  </tr>
                ) : (
                  vm.escalatedDeposits.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F0F4F9]/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#0A2540]">
                        {item.id}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                        {item.clientBankAccountId || 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-black text-[#0A2540]">
                        {vm.formatAmount(item.amount)} EUR
                      </td>
                      <td className="py-4 px-6 text-xs text-[#627D98] font-semibold">
                        {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'N/A'}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={vm.isResolving}
                            onClick={() => item.id && vm.handleResolveDeposit(item.id, 'APPROVE')}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="dark"
                            disabled={vm.isResolving}
                            onClick={() => item.id && vm.handleResolveDeposit(item.id, 'REJECT')}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Denegar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden border border-[#E2E8F0] p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F0F4F9] text-[#627D98] text-xs font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-4 px-6">ID Préstamo</th>
                  <th className="py-4 px-6">Cuenta</th>
                  <th className="py-4 px-6">Monto Solicitado</th>
                  <th className="py-4 px-6">Plazo</th>
                  <th className="py-4 px-6">Tasa TIN</th>
                  <th className="py-4 px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {vm.escalatedLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm font-bold text-[#627D98]">
                      No hay préstamos escalados pendientes
                    </td>
                  </tr>
                ) : (
                  vm.escalatedLoans.map((item) => (
                    <tr key={item.id} className="hover:bg-[#F0F4F9]/50 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs font-bold text-[#0A2540]">
                        {item.id}
                      </td>
                      <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                        {item.clientBankAccountId || 'N/A'}
                      </td>
                      <td className="py-4 px-6 font-black text-[#0A2540]">
                        {vm.formatAmount(item.amount)} EUR
                      </td>
                      <td className="py-4 px-6 text-xs text-[#627D98] font-bold">
                        {item.termPeriods} cuotas ({item.installmentFrequency})
                      </td>
                      <td className="py-4 px-6 text-xs text-[#0A2540] font-bold">
                        {item.interestRate?.toFixed(2)}%
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={vm.isResolving}
                            onClick={() => item.id && vm.handleResolveLoan(item.id, 'APPROVE')}
                          >
                            <Check className="w-3.5 h-3.5 mr-1" /> Aprobar
                          </Button>
                          <Button
                            size="sm"
                            variant="dark"
                            disabled={vm.isResolving}
                            onClick={() => item.id && vm.handleResolveLoan(item.id, 'REJECT')}
                          >
                            <X className="w-3.5 h-3.5 mr-1" /> Denegar
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}