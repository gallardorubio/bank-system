import { useFraudVM } from '../../viewmodels/operator/useFraudVM';
import { Card } from '../../components/Card';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ShieldAlert, ChevronLeft, ChevronRight, Download, X } from 'lucide-react';

export function OperatorFraud() {
  const vm = useFraudVM();

  if (vm.isLoading) {
    return <LoadingScreen label="Cargando auditoría de fraude" />;
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">
          Auditoría de Seguridad
        </span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">
          Fraude
        </h1>
      </div>

      {vm.error && (
        <div className="p-4 rounded-2xl bg-[#E8F0FE] text-[#0A2540] text-sm font-bold border border-[#E2E8F0]">
          {vm.error}
        </div>
      )}

      <Card className="overflow-hidden border border-[#E2E8F0] p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F0F4F9] text-[#627D98] text-xs font-bold uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="py-4 px-6">ID Alerta</th>
                <th className="py-4 px-6">ID Operación</th>
                <th className="py-4 px-6">ID Cuenta</th>
                <th className="py-4 px-6 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {vm.records.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-sm font-bold text-[#627D98]">
                    No se registran incidentes ni alertas de fraude
                  </td>
                </tr>
              ) : (
                vm.records.map((item) => (
                  <tr 
                    key={item.id} 
                    className="hover:bg-[#F0F4F9]/50 transition-colors cursor-pointer"
                    onClick={() => vm.handleRowClick(item)}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#0066FF]">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#e11d48] shrink-0" />
                        <span>{item.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                      {item.operationId || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                      <div className="flex items-center gap-2">
                        <span>{item.clientBankAccountId || 'N/A'}</span>
                        {item.clientBankAccountId && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              vm.handleDownloadAccountStatement(item.clientBankAccountId!);
                            }}
                            disabled={vm.isDownloadingAccountDoc}
                            className="p-1.5 hover:bg-[#E2E8F0] text-[#0A2540] rounded-md transition-colors cursor-pointer disabled:opacity-50"
                            title="Descargar informe de cuenta"
                          >
                            <Download className="w-4 h-4 text-[#0066FF]" />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-[#0A2540] font-semibold">
                      {item.detectedAt ? new Date(item.detectedAt).toLocaleString() : 'N/A'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINACIÓN */}
        {vm.pageMetadata && (vm.pageMetadata.totalPages ?? 0) > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-[#E2E8F0] bg-[#F0F4F9]">
            <span className="text-xs font-bold text-[#627D98]">
              Página {(vm.pageMetadata.number ?? 0) + 1} de {vm.pageMetadata.totalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={vm.page === 0}
                onClick={() => vm.setPage((p) => Math.max(0, p - 1))}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0A2540] disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={(vm.pageMetadata.number ?? 0) + 1 >= (vm.pageMetadata.totalPages ?? 1)}
                onClick={() => vm.setPage((p) => p + 1)}
                className="p-2 rounded-xl bg-white border border-[#E2E8F0] text-[#0A2540] disabled:opacity-40 cursor-pointer shadow-sm"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL DE DETALLES DE FRAUDE */}
      {vm.isDetailsModalOpen && vm.selectedRecord && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Detalles de Alerta de Fraude
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
            <div className="w-full space-y-8">
              <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6">
                
                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">ID Alerta</span>
                  <span className="text-base font-mono font-bold text-[#0A2540]">{vm.selectedRecord.id}</span>
                </div>
                
                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">ID Operación</span>
                  <span className="text-base font-mono font-bold text-[#0A2540]">{vm.selectedRecord.operationId || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuenta Cliente</span>
                  <span className="text-base font-mono font-bold text-[#0A2540]">{vm.selectedRecord.clientBankAccountId || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">ID Cliente</span>
                  <span className="text-base font-mono font-bold text-[#0A2540]">{vm.selectedRecord.clientId || 'N/A'}</span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha de Detección</span>
                  <span className="text-lg font-bold text-[#0A2540]">
                    {vm.selectedRecord.detectedAt ? new Date(vm.selectedRecord.detectedAt).toLocaleString() : '-'}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Motivo</span>
                  <span className="text-lg font-bold text-[#e11d48] max-w-sm text-right">{vm.selectedRecord.reason || 'Patrón anómalo detectado'}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuantía Involucrada</span>
                  <span className="text-4xl font-black text-[#0A2540]">
                    {vm.formatAmount(vm.selectedRecord.amount)} EUR
                  </span>
                </div>

              </div>
            </div>
          </div>
          <div className="w-full pb-4"></div>
        </div>
      )}
    </div>
  );
}