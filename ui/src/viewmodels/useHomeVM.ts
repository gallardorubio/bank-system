import { useState, useMemo } from 'react';
import { useGetMyBankAccount, useGetEntries } from '../api/bank-account-controller/bank-account-controller';
import { useCreateDeposit, useGetAllDeposits } from '../api/deposit-controller/deposit-controller';
import { useGetAllTransfers, useCreateTransfer } from '../api/transfer-controller/transfer-controller';
import { useGetAllLoans } from '../api/loan-controller/loan-controller';
import { useGetTrustedBankAccounts } from '../api/client-controller/client-controller';
import { customInstance } from '../api/mutator/instance';
import type { DepositRequest, TransferRequest, BankAccountEntryResponse } from '../api/model';

export function useHomeVM() {
  const { data: bankAccount, isLoading: isLoadingAccount, refetch: refetchAccount } = useGetMyBankAccount();
  const { data: deposits, refetch: refetchDeposits } = useGetAllDeposits();
  const { data: transfers, refetch: refetchTransfers } = useGetAllTransfers();
  const { data: loans } = useGetAllLoans();
  const { data: trustedAccounts, refetch: refetchTrusted } = useGetTrustedBankAccounts();
  
  const createDepositMutation = useCreateDeposit();
  const createTransferMutation = useCreateTransfer();

  const [depositAmount, setDepositAmount] = useState('');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  // Estados para el Modal de Detalles de Operación
  const [selectedOperation, setSelectedOperation] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Estados para el Wizard de Transferencia estilo Apple
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

  const { data: entriesPage, isLoading: isLoadingEntries, refetch: refetchEntries } = useGetEntries({
    concept: appliedFilters.concept,
    target_client_name: appliedFilters.target_client_name,
    created_at: appliedFilters.created_at,
    amount: appliedFilters.amount ? Number(appliedFilters.amount) : undefined,
    size: 20,
  });

  const allOperations = useMemo<BankAccountEntryResponse[]>(() => {
    const list: BankAccountEntryResponse[] = [];

    if (deposits) {
      deposits.forEach(dep => {
        list.push({
          id: dep.id,
          operationId: dep.id,
          operationType: 'DEPOSIT',
          description: 'Depósito en cuenta',
          amount: dep.amount,
          operationDirection: 'CREDIT',
          operationStatus: dep.status as any,
          createdAt: dep.createdAt,
        });
      });
    }

    if (transfers) {
      transfers.forEach(tr => {
        list.push({
          id: tr.id,
          operationId: tr.id,
          operationType: 'TRANSFER',
          description: tr.concept || 'Transferencia',
          amount: tr.amount,
          operationDirection: tr.clientBankAccountId === bankAccount?.id ? 'DEBIT' : 'CREDIT',
          operationStatus: tr.status as any,
          createdAt: tr.createdAt,
        });
      });
    }

    if (loans) {
      loans.forEach(loan => {
        list.push({
          id: loan.id,
          operationId: loan.id,
          operationType: 'LOAN',
          description: `Préstamo (${loan.termPeriods} cuotas)`,
          amount: loan.amount,
          operationDirection: 'CREDIT',
          operationStatus: loan.status as any,
          createdAt: loan.createdAt,
        });
      });
    }

    return list.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [deposits, transfers, loans, bankAccount?.id]);

  const filteredEntries = useMemo(() => {
    return allOperations.filter(item => {
      if (appliedFilters.concept && !item.description?.toLowerCase().includes(appliedFilters.concept.toLowerCase())) {
        return false;
      }
      if (appliedFilters.amount && item.amount !== Number(appliedFilters.amount)) {
        return false;
      }
      if (appliedFilters.created_at && item.createdAt) {
        const itemDate = item.createdAt.split('T')[0];
        if (itemDate !== appliedFilters.created_at) {
          return false;
        }
      }
      return true;
    });
  }, [allOperations, appliedFilters]);

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
      refetchEntries();
      refetchDeposits();
    } catch (err: any) {
      setDepositError(err?.response?.data?.detail || err?.message || 'Error al procesar el depósito');
    }
  };

  // Cargar detalles utilizando la ruta completa orientada al tipo de operación correcto
  const handleRowClick = async (entry: BankAccountEntryResponse) => {
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
      // Fallback por si la entidad es genérica
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

  // Métodos de control para Transferencias
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
      refetchEntries();
      refetchTransfers();
    } catch (err: any) {
      setTransferError(err?.response?.data?.detail || err?.message || 'Error al procesar la transferencia');
      setTransferStep(4);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
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
    entries: filteredEntries,
    isLoading: isLoadingAccount || isLoadingEntries,
    isDepositing: createDepositMutation.isPending,
    isTransferring: createTransferMutation.isPending,
    isDepositModalOpen,
    depositAmount,
    depositError,
    openDepositModal,
    closeDepositModal,
    setDepositAmount,
    handleConfirmDeposit,
    // Detalles de operación modal
    isDetailsModalOpen,
    selectedOperation,
    isLoadingDetails,
    handleRowClick,
    closeDetailsModal,
    // Transfer states
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