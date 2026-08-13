import { useState, useMemo } from 'react';
import { useGetMyBankAccount } from '../api/bank-account-controller/bank-account-controller';
import { useGetMyOperations } from '../api/operation-controller/operation-controller';
import { useCreateDeposit } from '../api/deposit-controller/deposit-controller';
import { useCreateTransfer } from '../api/transfer-controller/transfer-controller';
import { useGetTrustedBankAccounts } from '../api/client-controller/client-controller';
import { customInstance } from '../api/mutator/instance';
import type { DepositRequest, TransferRequest, OperationEntryResponse } from '../api/model';

export function useHomeVM() {
  const { data: bankAccount, isLoading: isLoadingAccount, refetch: refetchAccount } = useGetMyBankAccount();
  const { data: trustedAccounts, refetch: refetchTrusted } = useGetTrustedBankAccounts();
  
  const createDepositMutation = useCreateDeposit();
  const createTransferMutation = useCreateTransfer();

  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Detalles de Operación
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Wizard de Transferencia
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferStep, setTransferStep] = useState<1 | 2 | 3 | 4>(1);
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferConcept, setTransferConcept] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [saveAsTrusted, setSaveAsTrusted] = useState(false);
  const [transferError, setTransferError] = useState<string | null>(null);

  // Filtros
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
    concept: appliedFilters.concept || undefined,
    target_client_name: appliedFilters.target_client_name || undefined,
    created_at: appliedFilters.created_at || undefined,
    amount: appliedFilters.amount ? Number(appliedFilters.amount) : undefined,
    size: 20,
  });

  const entries = useMemo<OperationEntryResponse[]>(() => {
    return operationsPage?.content || [];
  }, [operationsPage?.content]);

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
    } catch (err: any) {
      setDepositError(err?.response?.data?.detail || err?.message || 'Error al procesar el depósito');
    }
  };

  const handleRowClick = async (entry: OperationEntryResponse) => {
    if (!entry.operationId) return;
    setIsLoadingDetails(true);
    setIsDetailsModalOpen(true);
    setSelectedOperation(null);

    let endpoint = `/api/v1/operations/${entry.operationId}`;
    if (entry.operationType === 'DEPOSIT') {
      endpoint = `/api/v1/deposits/${entry.operationId}`;
    } else if (entry.operationType === 'TRANSFER') {
      endpoint = `/api/v1/transfers/${entry.operationId}`;
    } else if (entry.operationType === 'LOAN') {
      endpoint = `/api/v1/loans/${entry.operationId}`;
    }

    try {
      const details = await customInstance<any>({
        url: endpoint,
        method: 'GET',
      });
      setSelectedOperation({ ...details, operationType: entry.operationType });
    } catch (err) {
      console.error('Error al cargar detalles de la operación:', err);
      try {
        const fallbackDetails = await customInstance<any>({
          url: `/api/v1/operations/${entry.operationId}`,
          method: 'GET',
        });
        setSelectedOperation(fallbackDetails);
      } catch (fallbackErr) {
        console.error('Error en fallback de detalles:', fallbackErr);
      }
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedOperation(null);
  };

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
    } catch (err: any) {
      setTransferError(err?.response?.data?.detail || err?.message || 'Error al procesar la transferencia');
      setTransferStep(4);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    setAppliedFilters({
      concept: filters.concept,
      target_client_name: filters.target_client_name,
      created_at: filters.created_at,
      amount: filters.amount,
    });
  };

  const clearFilters = () => {
    setFilters({ concept: '', target_client_name: '', created_at: '', amount: '' });
    setAppliedFilters({ concept: '', target_client_name: '', created_at: '', amount: '' });
  };

  return {
    bankAccount,
    trustedAccounts: trustedAccounts || [],
    entries,
    isLoading: isLoadingAccount || isLoadingOperations,
    isDepositing: createDepositMutation.isPending,
    isTransferring: createTransferMutation.isPending,
    isDepositModalOpen,
    depositAmount,
    depositError,
    openDepositModal,
    closeDepositModal,
    setDepositAmount,
    handleConfirmDeposit,
    isDetailsModalOpen,
    selectedOperation,
    isLoadingDetails,
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
    handleFilterChange,
    applyFilters,
    clearFilters,
  };
}