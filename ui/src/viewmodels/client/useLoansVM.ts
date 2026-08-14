import { useState } from 'react';
import { useGetAllLoans, useCreateLoan } from '../../api/loan-controller/loan-controller';
import type { LoanRequest, LoanRequestInstallmentFrequency } from '../../api/model';

export function useLoansVM() {
  const { data: loans, isLoading, refetch } = useGetAllLoans();
  const createLoanMutation = useCreateLoan();

  const [amount, setAmount] = useState<string>('');
  const [termPeriods, setTermPeriods] = useState<string>('12');
  const [installmentFrequency, setInstallmentFrequency] = useState<LoanRequestInstallmentFrequency>('MONTHLY');
  const [interestRate, setInterestRate] = useState<string>('5.5');

  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);

    const payload: LoanRequest = {
      amount: Number(amount),
      termPeriods: Number(termPeriods),
      installmentFrequency,
      interestRate: Number(interestRate),
    };

    try {
      await createLoanMutation.mutateAsync({ data: payload });
      setSuccessMsg('Solicitud de préstamo enviada correctamente.');
      setAmount('');
      refetch();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Error al solicitar préstamo');
    }
  };

  return {
    loans: loans || [],
    isLoading,
    isSubmitting: createLoanMutation.isPending,
    amount,
    setAmount,
    termPeriods,
    setTermPeriods,
    installmentFrequency,
    setInstallmentFrequency,
    interestRate,
    setInterestRate,
    successMsg,
    errorMsg,
    handleCreateLoan,
  };
}