import { useHomeVM } from '../../viewmodels/client/useHomeVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingScreen } from '../../components/LoadingScreen';
import { ArrowUpRight, ArrowDownLeft, Landmark, SlidersHorizontal, Search, RotateCcw, X, Loader2, Download, ChevronLeft, ChevronRight } from 'lucide-react';

export function ClientHomeView({ client, setActiveTab }: any) {
  const vm = useHomeVM();
  const { balanceValue, currency, activeOpId } = vm;

  if (vm.isLoading && !vm.bankAccount) {
    return <LoadingScreen label="Cargando panel..." />;
  }

  const getStatusBadge = (status?: string) => {
    if (!status) return <span className="text-[#627D98]">-</span>;
    return (
      <span className="px-3 py-1 rounded-md text-xs font-bold bg-[#F0F4F9] text-[#627D98] border border-[#E2E8F0]">
        {status}
      </span>
    );
  };

  return (
    <div className="flex flex-col gap-10 w-full pb-8 relative">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Bienvenido de nuevo,</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">{client?.name || 'Cliente'}</h1>
      </div>

      {/* SECCIÓN SUPERIOR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        <div className="lg:col-span-7 bg-[#0A2540] text-white rounded-[32px] p-12 flex flex-col justify-between min-h-[320px] shadow-lg">
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">Balance Disponible</span>
              {vm.bankAccount?.id && (
                <span className="text-xs font-mono bg-white/10 text-white/70 px-3 py-1.5 rounded-xl">
                  ID: {vm.bankAccount.id}
                </span>
              )}
            </div>
            <div className="text-7xl font-black mt-8 tracking-tighter flex items-baseline gap-3">
              <span>{balanceValue}</span>
              <span className="text-3xl font-bold text-[#0066FF]">{currency}</span>
            </div>
          </div>

          <div className="flex gap-8 mt-8">
            <Button 
              variant="primary" 
              size="lg" 
              onClick={vm.openTransferModal}
              className="gap-3 px-8 py-4 text-base font-bold shadow-md cursor-pointer"
            >
              <ArrowUpRight className="w-5 h-5" /> Transferir
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              onClick={vm.openDepositModal}
              className="gap-3 px-8 py-4 text-base font-bold cursor-pointer"
            >
              <ArrowDownLeft className="w-5 h-5" /> Depositar
            </Button>
          </div>
        </div>

        <div className="lg:col-span-5 bg-[#0066FF] text-white rounded-[32px] p-12 flex flex-col justify-between min-h-[320px] shadow-lg relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-6 translate-y-6 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div>
            <div className="flex justify-between items-start">
              <span className="text-sm text-white/85 font-bold uppercase tracking-widest">Financiación instantánea</span>
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-white backdrop-blur-md">
                <Landmark className="w-5 h-5" />
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight mt-6 leading-tight">
              Solicita préstamos fácilmente.
            </h2>
            <p className="text-sm text-white/80 mt-2">
              Tipos competitivos sin papeleos.
            </p>
          </div>

          <div className="mt-8">
            <Button 
              variant="dark" 
              size="lg" 
              onClick={() => setActiveTab && setActiveTab('loans')}
              className="w-full py-4 text-base font-bold shadow-md cursor-pointer"
            >
              Simular préstamo
            </Button>
          </div>
        </div>
      </div>

      {/* TABLAS DE MOVIMIENTOS Y OPERACIONES (7:5) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full mt-2">
        
        {/* MOVIMIENTOS (7/12) */}
        <Card className="px-8 pt-8 pb-8 flex flex-col w-full shadow-sm lg:col-span-7">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-2xl font-black text-[#0A2540]">Movimientos</p>
            </div>
            <Button 
              variant="secondary" 
              onClick={() => vm.setShowFilters(!vm.showFilters)} 
              className="gap-2 px-4 py-2 text-sm font-bold cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4" /> {vm.showFilters ? 'Ocultar filtros' : 'Filtrar'}
            </Button>
          </div>

          {vm.showFilters && (
            <div className="flex flex-col gap-3 mb-6 p-4 rounded-2xl bg-[#F0F4F9] border border-[#E2E8F0]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input type="text" name="concept" placeholder="Concepto..." value={vm.filters.concept} onChange={vm.handleFilterChange} className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0A2540] outline-none" />
                <input type="text" name="target_client_name" placeholder="Nombre cliente destino..." value={vm.filters.target_client_name} onChange={vm.handleFilterChange} className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0A2540] outline-none" />
                <div className="flex items-center bg-white rounded-xl border border-[#E2E8F0] px-3 h-10 overflow-hidden">
                  <span className="text-xs font-bold text-slate-400 mr-2 whitespace-nowrap">Desde:</span>
                  <input type="date" name="created_at" value={vm.filters.created_at} onChange={vm.handleFilterChange} className="bg-transparent w-full text-xs font-semibold text-[#0A2540] outline-none" />
                </div>
                <input type="number" step="0.01" name="amount" placeholder="Cuantía (€)" value={vm.filters.amount} onChange={vm.handleFilterChange} className="h-10 px-3 rounded-xl border border-[#E2E8F0] bg-white text-xs font-semibold text-[#0A2540] outline-none" />
              </div>
              <div className="flex justify-end gap-2 mt-1">
                <Button type="button" variant="primary" onClick={vm.applyFilters} className="h-10 px-4 text-xs font-bold gap-1 cursor-pointer">
                  <Search className="w-3.5 h-3.5" /> Aplicar
                </Button>
                <Button type="button" variant="ghost" onClick={vm.clearFilters} className="h-10 px-3 text-xs font-bold cursor-pointer bg-white border border-[#E2E8F0]">
                  <RotateCcw className="w-3.5 h-3.5 text-[#627D98]" />
                </Button>
              </div>
            </div>
          )}

          {vm.entries.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#627D98] text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-bold w-[120px] whitespace-nowrap">Fecha</th>
                    <th className="py-4 px-4 font-bold">Descripción</th>
                    <th className="py-4 px-4 font-bold text-right w-[140px] whitespace-nowrap">Cuantía</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-base font-semibold text-[#627D98]">
                  {vm.entries.map((entry: any) => (
                    <tr
                      key={entry.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      onClick={() => vm.handleRowClick(entry)}
                    >
                      <td className="py-4 px-4 text-sm font-medium text-[#627D98]">
                        {entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#627D98] break-words">
                        {entry.description || '-'}
                      </td>
                      <td className="py-4 px-4 font-bold text-base text-right text-[#0A2540]">
                        {entry.operationDirection === 'CREDIT' ? '+' : entry.operationDirection === 'DEBIT' ? '-' : ''}
                        {vm.formatAmount(entry.amount)} EUR
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-[#627D98] text-base font-semibold">
              No hay movimientos recientes.
            </div>
          )}
        </Card>

        {/* OPERACIONES (5/12) */}
        <Card className="px-8 pt-8 pb-8 flex flex-col w-full shadow-sm lg:col-span-5">
          <div className="flex items-center justify-between mb-6">
            <p className="text-2xl font-black text-[#0A2540]">Operaciones</p>
          </div>

          {vm.operations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#627D98] text-xs uppercase tracking-wider">
                    <th className="py-4 px-4 font-bold w-1/3">Fecha</th>
                    <th className="py-4 px-4 font-bold w-1/3 text-center">Tipo</th>
                    <th className="py-4 px-4 font-bold text-right w-1/3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] text-base font-semibold text-[#627D98]">
                  {vm.operations.map((op: any) => (
                    <tr
                      key={op.id}
                      className="hover:bg-[#F8FAFC] transition-colors cursor-pointer group"
                      onClick={() => vm.handleRowClick(op)}
                    >
                      <td className="py-4 px-4 text-sm font-medium text-[#627D98]">
                        {op.createdAt ? new Date(op.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-[#627D98] text-center">
                        {op.operationType}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {getStatusBadge(op.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-[#627D98] text-base font-semibold">
              No hay operaciones registradas.
            </div>
          )}
        </Card>
      </div>

      {/* MODAL DE DETALLES DE OPERACIÓN / MOVIMIENTO */}
      {vm.isDetailsModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              {vm.selectedOperation?.operationDirection ? 'Detalles del Movimiento' : 'Detalles de la Operación'}
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
            {vm.isLoadingDetails ? (
              <LoadingScreen label="Cargando detalles..." />
            ) : vm.selectedOperation ? (
              <div className="w-full space-y-8">
                {vm.selectedOperation.operationDirection ? (
                  // ===================
                  // VISTA DE MOVIMIENTO
                  // ===================
                  <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6">
                    <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                      <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tipo de Operación</span>
                      <span className="text-2xl font-black text-[#627D98]">{vm.selectedOperation.operationType}</span>
                    </div>

                    <div className="flex justify-between items-start pb-6 border-b border-[#E2E8F0] gap-4">
                      <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider whitespace-nowrap">Descripción</span>
                      <span className="text-lg font-bold text-[#627D98] text-right break-words">{vm.selectedOperation.description || '-'}</span>
                    </div>

                    <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                      <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Fecha de Creación</span>
                      <span className="text-lg font-bold text-[#627D98]">
                        {vm.selectedOperation.createdAt ? new Date(vm.selectedOperation.createdAt).toLocaleString() : '-'}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuantía</span>
                      <span className="text-4xl font-black text-[#0A2540]">
                        {vm.selectedOperation.operationDirection === 'CREDIT' ? '+' : ''}
                        {vm.selectedOperation.operationDirection === 'DEBIT' ? '-' : ''}
                        {vm.selectedOperation.amount?.toFixed(2) || '0.00'} {currency}
                      </span>
                    </div>
                  </div>
                ) : (
                  // ===================
                  // VISTA DE OPERACIÓN 
                  // ===================
                  <>
                    <div className="bg-[#F0F4F9] p-10 rounded-[40px] border border-[#E2E8F0] space-y-6">
                      <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                        <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tipo de Operación</span>
                        <span className="text-2xl font-black text-[#627D98]">{vm.selectedOperation.operationType}</span>
                      </div>

                      {vm.selectedOperation.operationType === 'TRANSFER' && (
                        <>
                          <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                            <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuenta Destino</span>
                            <span className="text-base font-mono font-bold text-[#627D98]">{vm.selectedOperation.targetBankAccountId}</span>
                          </div>
                          <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                            <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Concepto</span>
                            <span className="text-xl font-bold text-[#627D98]">{vm.selectedOperation.concept}</span>
                          </div>
                        </>
                      )}

                      {vm.selectedOperation.operationType === 'LOAN' && (
                        <>
                          <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                            <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Plazo / Frecuencia</span>
                            <span className="text-xl font-bold text-[#627D98]">{vm.selectedOperation.termPeriods} cuotas ({vm.selectedOperation.installmentFrequency})</span>
                          </div>
                          <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                            <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Tasa de Interés</span>
                            <span className="text-xl font-bold text-[#627D98]">{vm.selectedOperation.interestRate}% TIN</span>
                          </div>
                        </>
                      )}

                      {vm.selectedOperation.operationType === 'INSTALLMENT' && (
                        <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                          <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">ID de Préstamo Asociado</span>
                          <span className="text-base font-mono font-bold text-[#627D98]">{vm.selectedOperation.loanId}</span>
                        </div>
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
                          {vm.selectedOperation.amount?.toFixed(2)} {currency}
                        </span>
                      </div>
                    </div>

                    {/* HISTORIAL DE ESTADOS (Solo Operaciones) */}
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
                                {/* Línea conectora */}
                                {index !== arr.length - 1 && (
                                  <div className="absolute -left-[26px] top-3 bottom-[-40px] w-1 bg-[#E2E8F0] z-0" />
                                )}
                                {/* Punto azul original */}
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

                    {/* BOTÓN DE DESCARGA DE INFORME (Solo Operaciones) */}
                    {activeOpId && (
                      <div className="w-full pt-2">
                        <Button
                          variant="primary"
                          className="w-full py-4 text-base font-bold shadow-sm cursor-pointer gap-2 rounded-2xl bg-[#0066FF] hover:bg-[#0052CC]"
                          onClick={() => vm.handleDownloadStatement(activeOpId)}
                        >
                          <Download className="w-5 h-5" />
                          Descargar informe de operación
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-[#627D98] text-lg font-semibold">
                No se pudieron cargar los detalles.
              </div>
            )}
          </div>

          <div className="w-full pb-4"></div>
        </div>
      )}

      {/* MODAL DE DEPÓSITO */}
      {vm.isDepositModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Depositar fondos en cuenta
            </span>
            <button 
              onClick={vm.closeDepositModal}
              className="absolute top-0 right-2 p-3 rounded-full hover:bg-[#F0F4F9] text-[#0A2540] transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-10 h-10" />
            </button>
          </div>

          <form onSubmit={vm.handleConfirmDeposit} id="deposit-form" className="flex flex-col items-center justify-center max-w-xl mx-auto w-full my-auto text-center gap-4">
            {vm.depositError && (
              <div className="p-3.5 text-xs bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100 w-full mb-2">
                {vm.depositError}
              </div>
            )}

            <div className="flex flex-col items-center justify-center w-full">
              <input 
                type="text" 
                inputMode="decimal"
                required 
                placeholder="0.00" 
                value={vm.depositAmount} 
                onChange={vm.handleDepositAmountChange} 
                className="text-8xl md:text-9xl font-black text-[#0A2540] text-center bg-transparent outline-none border-none ring-0 w-full tracking-tighter placeholder:text-slate-200 caret-transparent focus:caret-[#0066FF] cursor-text py-2" 
              />
              <span className="text-3xl font-bold text-[#0066FF] tracking-wider uppercase mt-6 select-none">
                {currency}
              </span>
            </div>
          </form>

          <div className="max-w-md mx-auto w-full pb-4">
            <Button 
              form="deposit-form" 
              type="submit" 
              disabled={vm.isDepositing || !vm.depositAmount || Number(vm.depositAmount) <= 0} 
              className="w-full py-5 text-lg font-bold shadow-lg cursor-pointer gap-2 rounded-2xl"
            >
              {vm.isDepositing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar depósito'}
            </Button>
          </div>
        </div>
      )}

      {/* MODAL DE TRANSFERENCIA */}
      {vm.isTransferModalOpen && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150">
          <div className="relative flex items-center justify-center w-full pt-2">
            <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
              Realizar transferencia ({vm.transferStep} de 4)
            </span>
            <button 
              onClick={vm.closeTransferModal}
              className="absolute top-0 right-2 p-3 rounded-full hover:bg-[#F0F4F9] text-[#0A2540] transition-colors cursor-pointer"
              title="Cerrar"
            >
              <X className="w-10 h-10" />
            </button>
          </div>

          <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full my-auto text-center gap-6">
            {vm.transferError && (
              <div className="p-3.5 text-xs bg-red-50 text-red-600 rounded-2xl font-bold border border-red-100 w-full">
                {vm.transferError}
              </div>
            )}

            {vm.transferStep === 1 && (
              <div className="flex flex-col items-center w-full max-w-xl gap-6 animate-in fade-in duration-200">
                <span className="text-2xl font-black text-[#0A2540]">¿A qué cuenta deseas enviar?</span>
                <input 
                  type="text"
                  autoFocus
                  placeholder="UUID de cuenta destino..."
                  value={vm.transferTargetId}
                  onChange={e => vm.setTransferTargetId(e.target.value)}
                  className="w-full h-16 px-6 text-center text-lg font-semibold bg-[#F0F4F9] rounded-2xl border border-[#E2E8F0] outline-none focus:border-[#0066FF]"
                />
                
                {vm.trustedAccounts && vm.trustedAccounts.length > 0 && (
                  <div className="w-full text-left mt-2">
                    <span className="text-xs font-bold text-[#627D98] uppercase tracking-wider block mb-3">Tus contactos de confianza:</span>
                    <div className="grid grid-cols-1 gap-2.5 max-h-48 overflow-y-auto pr-1">
                      {vm.trustedAccounts.map((acc: any) => (
                        <div 
                          key={acc.bankAccountId}
                          onClick={() => vm.setTransferTargetId(acc.bankAccountId!)}
                          className={`p-4 rounded-2xl border cursor-pointer flex justify-between items-center transition-all ${
                            vm.transferTargetId === acc.bankAccountId 
                              ? 'bg-[#E8F0FE] border-[#0066FF] shadow-sm' 
                              : 'bg-[#F0F4F9] hover:bg-[#E2E8F0]/50 border-[#E2E8F0]'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-[#0A2540]">{acc.clientName}</span>
                            <span className="text-xs font-mono text-[#627D98] mt-0.5">{acc.bankAccountId}</span>
                          </div>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            vm.transferTargetId === acc.bankAccountId ? 'border-[#0066FF] bg-[#0066FF] text-white' : 'border-slate-300 bg-white'
                          }`}>
                            {vm.transferTargetId === acc.bankAccountId && <span className="text-xs font-black">✓</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {vm.transferStep === 2 && (
              <div className="flex flex-col items-center w-full gap-6 animate-in fade-in duration-200">
                <span className="text-2xl font-black text-[#0A2540]">Indica el concepto</span>
                <input 
                  type="text"
                  autoFocus
                  placeholder="Ej: Alquiler, Factura..."
                  value={vm.transferConcept}
                  onChange={e => vm.setTransferConcept(e.target.value)}
                  className="w-full h-16 px-6 text-center text-lg font-semibold bg-[#F0F4F9] rounded-2xl border border-[#E2E8F0] outline-none focus:border-[#0066FF]"
                />
                {vm.isUuidValid(vm.transferTargetId) && (
                  <label className="flex items-center gap-3 cursor-pointer mt-2 animate-in fade-in duration-200">
                    <input 
                      type="checkbox"
                      checked={vm.saveAsTrusted}
                      onChange={e => vm.setSaveAsTrusted(e.target.checked)}
                      className="w-5 h-5 rounded text-[#0066FF] focus:ring-[#0066FF]"
                    />
                    <span className="text-sm font-bold text-[#0A2540]">Guardar como cuenta de confianza</span>
                  </label>
                )}
              </div>
            )}

            {vm.transferStep === 3 && (
              <div className="flex flex-col items-center justify-center w-full animate-in fade-in duration-200">
                <span className="text-xs font-bold text-[#627D98] uppercase tracking-widest mb-4">Introduce la cuantía</span>
                <input 
                  type="text" 
                  inputMode="decimal"
                  required 
                  placeholder="0.00" 
                  value={vm.transferAmount} 
                  onChange={vm.handleTransferAmountChange} 
                  className="text-8xl md:text-9xl font-black text-[#0A2540] text-center bg-transparent outline-none border-none ring-0 w-full tracking-tighter placeholder:text-slate-200 caret-transparent focus:caret-[#0066FF] cursor-text py-2" 
                />
                <span className="text-3xl font-bold text-[#0066FF] tracking-wider uppercase mt-6 select-none">
                  {currency}
                </span>
              </div>
            )}

            {vm.transferStep === 4 && (
              <div className="flex flex-col items-center w-full max-w-3xl gap-6 animate-in fade-in duration-200">
                <div className="w-full bg-[#F0F4F9] p-12 rounded-[40px] border border-[#E2E8F0] space-y-8 text-left shadow-sm">
                  <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuenta destino</span>
                    <span className="text-lg font-mono font-bold text-[#0A2540] truncate max-w-[450px]" title={vm.transferTargetId}>{vm.transferTargetId}</span>
                  </div>
                  <div className="flex justify-between items-center pb-6 border-b border-[#E2E8F0]">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Concepto</span>
                    <span className="text-xl font-bold text-[#0A2540]">{vm.transferConcept}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-[#627D98] uppercase tracking-wider">Cuantía total</span>
                    <span className="text-4xl font-black text-[#0066FF]">{Number(vm.transferAmount || 0).toFixed(2)} {currency}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="max-w-md mx-auto w-full pb-4 flex gap-4">
            {vm.transferStep > 1 && (
              <Button 
                variant="secondary"
                onClick={() => vm.setTransferStep((vm.transferStep - 1) as any)}
                className="py-5 px-6 rounded-2xl cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}

            {vm.transferStep < 4 ? (
              <Button 
                variant="primary"
                disabled={
                  (vm.transferStep === 1 && !vm.isUuidValid(vm.transferTargetId)) ||
                  (vm.transferStep === 2 && !vm.transferConcept) ||
                  (vm.transferStep === 3 && (!vm.transferAmount || Number(vm.transferAmount) <= 0))
                }
                onClick={() => vm.setTransferStep((vm.transferStep + 1) as any)}
                className="w-full py-5 text-lg font-bold shadow-lg cursor-pointer gap-2 rounded-2xl"
              >
                Siguiente <ChevronRight className="w-5 h-5" />
              </Button>
            ) : (
              <Button 
                variant="primary"
                disabled={vm.isTransferring}
                onClick={vm.handleConfirmTransfer}
                className="w-full py-5 text-lg font-bold shadow-lg cursor-pointer gap-2 rounded-2xl"
              >
                {vm.isTransferring ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirmar transferencia'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}