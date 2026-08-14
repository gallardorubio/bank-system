import { useState } from 'react';
import { useGetEscalatedDeposits, useResolveDeposit } from '../../api/deposit-controller/deposit-controller';
import { useGetEscalatedLoans, useResolveLoan } from '../../api/loan-controller/loan-controller';
import { customInstance } from '../../api/mutator/instance';
import type { DepositResponse, LoanResponse } from '../../api/model';

export type ResolutionTarget = {
  id: string;
  type: 'deposit' | 'loan';
  action: 'APPROVE' | 'REJECT';
};

export function useEscalatedVM() {
  const {
    data: escalatedDeposits,
    isLoading: isLoadingDeposits,
    refetch: refetchDeposits,
  } = useGetEscalatedDeposits();

  const {
    data: escalatedLoans,
    isLoading: isLoadingLoans,
    refetch: refetchLoans,
  } = useGetEscalatedLoans();

  const resolveDepositMutation = useResolveDeposit();
  const resolveLoanMutation = useResolveLoan();

  const [activeSubTab, setActiveSubTab] = useState<'deposits' | 'loans'>('deposits');
  const [actionError, setActionError] = useState<string | null>(null);

  const [selectedOperation, setSelectedOperation] = useState<DepositResponse | LoanResponse | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const [confirmResolution, setConfirmResolution] = useState<ResolutionTarget | null>(null);
  const [resolutionReason, setResolutionReason] = useState('');

  const [isDownloadingAccountDoc, setIsDownloadingAccountDoc] = useState(false);

  const formatAmount = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  const handleRowClick = (item: DepositResponse | LoanResponse, type: 'DEPOSIT' | 'LOAN') => {
    if (!item.id) return;
    setSelectedOperation({ ...item, operationType: type });
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOperation(null);
  };

  const openConfirmDialog = (id: string, type: 'deposit' | 'loan', action: 'APPROVE' | 'REJECT') => {
    setActionError(null);
    setResolutionReason('');
    setConfirmResolution({ id, type, action });
  };

  const closeConfirmDialog = () => {
    setConfirmResolution(null);
    setResolutionReason('');
  };

  const executeResolution = async () => {
    if (!confirmResolution) return;
    setActionError(null);
    const { id, type, action } = confirmResolution;
    const reason = resolutionReason.trim() || `Resolución manual del operador: ${action}`;

    try {
      if (type === 'deposit') {
        await resolveDepositMutation.mutateAsync({
          id,
          data: { action, reason },
        });
        refetchDeposits();
      } else {
        await resolveLoanMutation.mutateAsync({
          id,
          data: { action, reason },
        });
        refetchLoans();
      }
      closeConfirmDialog();
      if (isDetailsModalOpen) {
        closeDetailsModal();
      }
    } catch (err: any) {
      setActionError(err?.response?.data?.detail || err?.message || 'Error al procesar la resolución');
    }
  };

  const handleDownloadAccountStatement = async (bankAccountId: string) => {
    setIsDownloadingAccountDoc(true);
    try {
      const blob = await customInstance<Blob>({
        url: `/api/v1/bank-accounts/${bankAccountId}/statement`,
        method: 'GET',
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_cuenta_${bankAccountId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error descargando extracto de cuenta:', err);
    } finally {
      setIsDownloadingAccountDoc(false);
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
    selectedOperation,
    isDetailsModalOpen,
    confirmResolution,
    resolutionReason,
    setResolutionReason,
    isDownloadingAccountDoc,
    handleRowClick,
    closeDetailsModal,
    openConfirmDialog,
    closeConfirmDialog,
    executeResolution,
    handleDownloadAccountStatement,
  };
}