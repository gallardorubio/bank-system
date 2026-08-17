import { useState } from 'react';
import { useGetMyBankAccount, useGetEntries } from '../../api/bank-account-controller/bank-account-controller';
import { useGetMyOperations } from '../../api/operation-controller/operation-controller';
import { useCreateDeposit } from '../../api/deposit-controller/deposit-controller';
import { useCreateTransfer } from '../../api/transfer-controller/transfer-controller';
import { useGetTrustedBankAccounts } from '../../api/client-controller/client-controller';
import { customInstance } from '../../api/mutator/instance';
import type { DepositRequest, TransferRequest } from '../../api/model';

export function useHomeVM() {
  const { data: bankAccount, isLoading: isLoadingAccount, refetch: refetchAccount } = useGetMyBankAccount();
  const { data: trustedAccounts, refetch: refetchTrusted } = useGetTrustedBankAccounts();
  
  const createDepositMutation = useCreateDeposit();
  const createTransferMutation = useCreateTransfer();
  
  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);
  
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferConcept, setTransferConcept] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [saveAsTrusted, setSaveAsTrusted] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);
  
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    concept: '',
    target_client_name: '',
    created_at: '',
    amount: '',
  });

  const [appliedFilters, setAppliedFilters] = useState({
    concept: '',
    target_client_name: '',
    created_at: '',
    amount: '',
  });

  const {
    data: operationsPage,
    isLoading: isLoadingOperations,
    refetch: refetchOperations
  } = useGetMyOperations({
    size: 50,
  });

  const formatCreatedAtParam = (dateStr: string) => {
    if (!dateStr) return undefined;
    try {
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date.toISOString();
    } catch {
      return undefined;
    }
  };

  const {
    data: entriesPage,
    isLoading: isLoadingEntries,
    refetch: refetchEntries
  } = useGetEntries({
    concept: appliedFilters.concept || undefined,
    target_client_name: appliedFilters.target_client_name || undefined,
    created_at: formatCreatedAtParam(appliedFilters.created_at),
    amount: appliedFilters.amount ? Number(appliedFilters.amount) : undefined,
    size: 50,
  });

  const entries = entriesPage?.content || [];
  const operations = operationsPage?.content || [];

  const formatAmount = (val: any) => {
    if (val === undefined || val === null) return '0.00';
    return Number(val).toFixed(2);
  };

  const balanceValue = bankAccount?.balance !== undefined ? formatAmount(bankAccount.balance) : '0.00';
  const currency = bankAccount?.currency || 'EUR';

  const isUuidValid = (uuid: string) => {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid);
  };

  const handleAmountInputChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const val = e.target.value.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) return;
    if (parts[1] && parts[1].length > 2) return;
    setter(val);
  };

  const handleDepositAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => handleAmountInputChange(e, setDepositAmount);
  const handleTransferAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => handleAmountInputChange(e, setTransferAmount);

  const openDepositModal = () => {
    setDepositAmount('');
    setDepositError(null);
    setIsDepositModalOpen(true);
  };

  const closeDepositModal = () => {
    setIsDepositModalOpen(false);
    setDepositAmount('');
    setDepositError(null);
  };

  const handleConfirmDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(depositAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      setDepositError('Introduce una cantidad válida');
      return;
    }
    setDepositError(null);
    const payload: DepositRequest = { amount: parsedAmount };
    try {
      await createDepositMutation.mutateAsync({ data: payload });
      closeDepositModal();
      refetchAccount();
      refetchOperations();
      refetchEntries();
    } catch (err: any) {
      setDepositError(err?.response?.data?.detail || err?.message || 'Error al procesar el depósito');
    }
  };

  const handleRowClick = async (item: any) => {
    setIsDetailsModalOpen(true);
    setIsLoadingDetails(true);
    setSelectedOperation(item);

    const opId = item.operationId || item.id;
    if (!opId) {
      setIsLoadingDetails(false);
      return;
    }

    let endpoint = `/api/v1/operations/${opId}`;
    if (item.operationType === 'DEPOSIT') endpoint = `/api/v1/deposits/${opId}`;
    else if (item.operationType === 'TRANSFER') endpoint = `/api/v1/transfers/${opId}`;
    else if (item.operationType === 'LOAN') endpoint = `/api/v1/loans/${opId}`;
    else if (item.operationType === 'INSTALLMENT') endpoint = `/api/v1/operations/${opId}`;

    try {
      const details = await customInstance<any>({ url: endpoint, method: 'GET' });
      setSelectedOperation({ ...item, ...details });
    } catch (err) {
      console.error('Error al cargar detalles de la operación:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOperation(null);
  };

  const activeOpId = selectedOperation?.operationId || selectedOperation?.id;

  const openTransferModal = () => {
    setTransferStep(1);
    setTransferTargetId('');
    setTransferConcept('');
    setTransferAmount('');
    setSaveAsTrusted(false);
    setTransferError(null);
    refetchTrusted();
    setIsTransferModalOpen(true);
  };

  const closeTransferModal = () => {
    setIsTransferModalOpen(false);
    setTransferStep(1);
    setTransferTargetId('');
    setTransferConcept('');
    setTransferAmount('');
    setTransferError(null);
  };

  const handleConfirmTransfer = async () => {
    const parsedAmount = Number(transferAmount);
    if (!transferTargetId || !transferConcept || !parsedAmount || parsedAmount <= 0) {
      setTransferError('Por favor, completa todos los campos correctamente.');
      return;
    }
    setTransferError(null);
    const payload: TransferRequest = {
      targetBankAccountId: transferTargetId,
      concept: transferConcept,
      amount: parsedAmount,
      saveAsTrusted,
    };
    try {
      await createTransferMutation.mutateAsync({ data: payload });
      closeTransferModal();
      refetchAccount();
      refetchOperations();
      refetchEntries();
    } catch (err: any) {
      setTransferError(err?.response?.data?.detail || err?.message || 'Error al procesar la transferencia');
      setTransferStep(4);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = () => {
    setAppliedFilters({ ...filters });
  };

  const clearFilters = () => {
    setFilters({ concept: '', target_client_name: '', created_at: '', amount: '' });
    setAppliedFilters({ concept: '', target_client_name: '', created_at: '', amount: '' });
  };

  const handleDownloadStatement = async (id?: string | null) => {
    const targetId = id || activeOpId;
    if (!targetId) return;
    try {
      const blob = await customInstance<Blob>({
        url: `/api/v1/operations/${targetId}/statement`,
        method: 'GET',
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `informe_operacion_${targetId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar el informe:', err);
    }
  };

  return {
    bankAccount,
    trustedAccounts: trustedAccounts || [],
    entries,
    operations,
    isLoading: isLoadingAccount || isLoadingOperations || isLoadingEntries,
    isDepositing: createDepositMutation.isPending,
    isTransferring: createTransferMutation.isPending,
    isDepositModalOpen,
    depositAmount,
    depositError,
    openDepositModal,
    closeDepositModal,
    handleConfirmDeposit,
    isDetailsModalOpen,
    isLoadingDetails,
    selectedOperation,
    activeOpId,
    handleRowClick,
    closeDetailsModal,
    isTransferModalOpen,
    transferStep,
    setTransferStep,
    transferTargetId,
    setTransferTargetId,
    transferConcept,
    setTransferConcept,
    transferAmount,
    setTransferAmount,
    saveAsTrusted,
    setSaveAsTrusted,
    transferError,
    openTransferModal,
    closeTransferModal,
    handleConfirmTransfer,
    filters,
    showFilters,
    setShowFilters,
    handleFilterChange,
    applyFilters,
    clearFilters,
    handleDownloadStatement,
    formatAmount,
    balanceValue,
    currency,
    isUuidValid,
    handleDepositAmountChange,
    handleTransferAmountChange
  };
}