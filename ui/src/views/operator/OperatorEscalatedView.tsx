import { useEscalatedVM } from '../../viewmodels/operator/useEscalatedVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { X, Loader2, Download } from 'lucide-react';

export function OperatorEscalatedView() {
  const vm = useEscalatedVM();

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando" />;
  }

  const currentList = vm.activeSubTab === 'deposits' ? vm.escalatedDeposits : vm.escalatedLoans;

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-xs sm:text-sm text-[#627D98] font-bold uppercase tracking-widest">
            Resolución manual
          </span>
          <h1 className="text-3xl font-black text-[#0A2540] tracking-tighter mt-3 sm:text-4xl lg:text-5xl">
            Escalados
          </h1>
        </div>
        <div className="flex gap-2 bg-[#E2E8F0]/60 p-1.5 rounded-2xl">
          <button
            onClick={() => vm.setActiveSubTab('deposits')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              vm.activeSubTab === 'deposits'
                ? 'bg-white text-[#0A2540] shadow-sm'
                : 'text-[#627D98]'
            }`}
          >
            Depósitos ({vm.escalatedDeposits.length})
          </button>
          <button
            onClick={() => vm.setActiveSubTab('loans')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              vm.activeSubTab === 'loans'
                ? 'bg-white text-[#0A2540] shadow-sm'
                : 'text-[#627D98]'
            }`}
          >
            Préstamos ({vm.escalatedLoans.length})
          </button>
        </div>
      </div>

      <Card className="overflow-hidden border border-[#E2E8F0] p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F0F4F9] text-[#627D98] text-xs font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-4 px-6">ID Operación</th>
                <th className="py-4 px-6">ID Cuenta</th>
                <th className="py-4 px-6">Fecha</th>
                <th className="py-4 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {currentList.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-bold text-[#627D98]">
                    No hay operaciones pendientes de resolución.
                  </td>
                </tr>
              ) : (
                currentList.map((item: any) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[#F0F4F9]/50 transition-colors cursor-pointer"
                    onClick={() => vm.handleRowClick(item, vm.activeSubTab === 'deposits' ? 'DEPOSIT' : 'LOAN')}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#0066FF]">
                      {item.id}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                      <div className="flex items-center gap-2">
                        <span>{item.clientBankAccountId}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            vm.handleDownloadAccountStatement(item.clientBankAccountId);
                          }}
                          disabled={vm.isDownloadingAccountDoc}
                          className="p-1.5 hover:bg-[#E2E8F0] text-[#0A2540] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                          title="Descargar informe de cuenta"
                        >
                          <Download className="w-4 h-4 text-[#0066FF]" />
                        </button>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs font-semibold text-[#0A2540]">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      <Button
                        variant="primary"
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          vm.openConfirmDialog(item.id, vm.activeSubTab === 'deposits' ? 'deposit' : 'loan', 'APPROVE');
                        }}
                      >
                        Aprobar
                      </Button>
                      <Button
                        variant="dark"
                        size="sm"
                        className="rounded-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          vm.openConfirmDialog(item.id, vm.activeSubTab === 'deposits' ? 'deposit' : 'loan', 'DENY');
                        }}
                      >
                        Denegar
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {vm.isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Detalles de la Operación
            </span>
            <button 
              onClick={vm.closeDetailsModal}
              className="absolute top-0 right-2 p-3 rounded-full hover:bg-[#F0F4F9] text-[#0A2540] transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-10 h-10" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center max-w-3xl mx-auto w-full my-auto gap-8 pt-16 pb-12">
            {vm.selectedOperation ? (
              <div className="w-full space-y-8">
                <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6">
                  <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tipo de Operación</span>
                    <span className="text-2xl font-black text-[#627D98]">{vm.selectedOperation.operationType}</span>
                  </div>

                  {vm.selectedOperation.operationType === 'TRANSFER' && (
                    <>
                      <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                        <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuenta Destino</span>
                        <span className="text-base font-mono font-bold text-[#627D98]">{(vm.selectedOperation as any).targetBankAccountId}</span>
                      </div>
                      <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                        <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Concepto</span>
                        <span className="text-xl font-bold text-[#627D98]">{(vm.selectedOperation as any).concept}</span>
                      </div>
                    </>
                  )}

                  {vm.selectedOperation.operationType === 'LOAN' && (
                    <>
                      <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                        <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Plazo / Frecuencia</span>
                        <span className="text-xl font-bold text-[#627D98]">{(vm.selectedOperation as any).termPeriods} cuotas ({(vm.selectedOperation as any).installmentFrequency})</span>
                      </div>
                      <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                        <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tasa de Interés</span>
                        <span className="text-xl font-bold text-[#627D98]">{(vm.selectedOperation as any).interestRate}% TIN</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha de Creación</span>
                    <span className="text-lg font-bold text-[#627D98]">
                      {vm.selectedOperation.createdAt ? new Date(vm.selectedOperation.createdAt).toLocaleString() : '-'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuantía</span>
                    <span className="text-4xl font-black text-[#0A2540]">
                      {vm.formatAmount(vm.selectedOperation.amount)} EUR
                    </span>
                  </div>
                </div>

                {vm.selectedOperation.statusHistory && vm.selectedOperation.statusHistory.length > 0 && (
                  <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6 text-left">
                    <span className="text-base font-bold text-[#627D98] uppercase tracking-wider block mb-4">Historial de Estados</span>
                    
                    {vm.selectedOperation.statusHistory.length === 1 ? (
                      <div className="flex flex-col gap-1.5 pl-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-4 h-4 rounded-full bg-[#0066FF] border-4 border-white shadow-md shrink-0" />
                            <span className="font-black text-xl text-[#0A2540]">{vm.selectedOperation.statusHistory[0].status}</span>
                          </div>
                          <span className="text-sm font-bold text-[#627D98]">
                            {vm.selectedOperation.statusHistory[0].createdAt ? new Date(vm.selectedOperation.statusHistory[0].createdAt).toLocaleString() : ''}
                          </span>
                        </div>
                        {vm.selectedOperation.statusHistory[0].reason && (
                          <p className="text-sm text-slate-600 font-semibold pl-8">{vm.selectedOperation.statusHistory[0].reason}</p>
                        )}
                      </div>
                    ) : (
                      <div className="pl-8 flex flex-col gap-8">
                        {vm.selectedOperation.statusHistory.map((phase: any, index: number, arr: any[]) => (
                          <div key={index} className="relative flex flex-col gap-1.5">
                            {index !== arr.length - 1 && (
                              <div className="absolute -left-[26px] top-3 bottom-[-40px] w-1 bg-[#E2E8F0] z-0" />
                            )}
                            <div className="absolute -left-8 top-1.5 w-4 h-4 rounded-full bg-[#0066FF] border-4 border-white shadow-md z-10" />
                            
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
            ) : (
              <div className="text-center py-12 text-[#627D98] text-lg font-semibold">
                No se pudieron cargar los detalles de la operación.
              </div>
            )}
          </div>
          <div className="w-full pb-4"></div>
        </div>
      )}

      {vm.confirmResolution && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Confirmar Resolución
            </span>
            <button 
              onClick={vm.closeConfirmDialog}
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
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Acción Seleccionada</span>
                  <span className="text-2xl font-black text-[#0A2540]">
                    {vm.confirmResolution.action === 'APPROVE' ? 'APROBAR' : 'DENEGAR'}
                  </span>
                </div>
                
                <div className="space-y-4">
                  <label className="text-sm font-bold text-[#627D98] uppercase tracking-wider block">
                    Motivo de la resolución
                  </label>
                  <textarea
                    value={vm.resolutionReason}
                    onChange={(e) => vm.setResolutionReason(e.target.value)}
                    className="w-full p-6 rounded-3xl border border-[#E2E8F0] bg-white text-base font-semibold text-[#0A2540] outline-none focus:border-[#0066FF] min-h-[160px] resize-none"
                    placeholder="Describe el motivo por el que tomas esta decisión..."
                  />
                </div>

                {vm.actionError && (
                  <div className="p-4 rounded-2xl bg-[#E8F0FE] text-[#0A2540] text-sm font-bold border border-[#E2E8F0]">
                    {vm.actionError}
                  </div>
                )}
              </div>

              <div className="w-full pt-2">
                <Button
                  variant={vm.confirmResolution.action === 'APPROVE' ? 'primary' : 'dark'}
                  onClick={vm.executeResolution}
                  disabled={vm.isResolving}
                  className="w-full py-5 text-base font-bold shadow-sm cursor-pointer rounded-2xl"
                >
                  {vm.isResolving ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirmar Resolución'}
                </Button>
              </div>
            </div>
          </div>
          <div className="w-full pb-4"></div>
        </div>
      )}
    </div>
  );
}