import { useFraudVM } from '../../viewmodels/operator/useFraudVM';
import { Card } from '../../components/Card';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';

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
                <th className="py-4 px-6">Cuenta</th>
                <th className="py-4 px-6">Monto Detectado</th>
                <th className="py-4 px-6">Motivo</th>
                <th className="py-4 px-6 text-right">Fecha Detección</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {vm.records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-sm font-bold text-[#627D98]">
                    No se registran incidentes ni alertas de fraude
                  </td>
                </tr>
              ) : (
                vm.records.map((item) => (
                  <tr key={item.id} className="hover:bg-[#F0F4F9]/50 transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-bold text-[#0A2540]">
                      <div className="flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-[#0066FF] shrink-0" />
                        <span>{item.id}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                      {item.operationId || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-[#627D98]">
                      {item.clientBankAccountId || 'N/A'}
                    </td>
                    <td className="py-4 px-6 font-black text-[#0A2540]">
                      {vm.formatAmount(item.amount)} EUR
                    </td>
                    <td className="py-4 px-6 text-xs text-[#0A2540] font-semibold max-w-xs truncate">
                      {item.reason || 'Patrón anómalo'}
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-[#627D98] font-semibold">
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
    </div>
  );
}