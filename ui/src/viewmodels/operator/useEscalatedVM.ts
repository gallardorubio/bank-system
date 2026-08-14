import { useState } from 'react';
import { useGetEscalatedDeposits, useResolveDeposit } from '../../api/deposit-controller/deposit-controller';
import { useGetEscalatedLoans, useResolveLoan } from '../../api/loan-controller/loan-controller';

export function useEscalatedVM() {
  const { 
    data: escalatedDeposits, 
    isLoading: isLoadingDeposits, 
    refetch: refetchDeposits 
  } = useGetEscalatedDeposits();

  const { 
    data: escalatedLoans, 
    isLoading: isLoadingLoans, 
    refetch: refetchLoans 
  } = useGetEscalatedLoans();

  const resolveDepositMutation = useResolveDeposit();
  const resolveLoanMutation = useResolveLoan();

  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'loans'>('deposits');
  const [actionError, setActionError] = useState<string | null>(null);

  const formatAmount = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  const handleResolveDeposit = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setActionError(null);
    try {
      await resolveDepositMutation.mutateAsync({
        id,
        data: { action, reason: reason || `Resuelto como ${action}` },
      });
      refetchDeposits();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || 'Error al resolver depósito');
    }
  };

  const handleResolveLoan = async (id: string, action: 'APPROVE' | 'REJECT', reason?: string) => {
    setActionError(null);
    try {
      await resolveLoanMutation.mutateAsync({
        id,
        data: { action, reason: reason || `Resuelto como ${action}` },
      });
      refetchLoans();
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || 'Error al resolver préstamo');
    }
  };

  return {
    escalatedDeposits: escalatedDeposits || [],
    escalatedLoans: escalatedLoans || [],
    isLoading: isLoadingDeposits || isLoadingLoans,
    isResolving: resolveDepositMutation.isPending || resolveLoanMutation.isPending,
    activeSubTab,
    setActiveSubTab,
    actionError,
    formatAmount,
    handleResolveDeposit,
    handleResolveLoan,
  };
}