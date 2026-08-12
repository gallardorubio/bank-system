import { useGetClientPersonal } from '../api/client-controller/client-controller';
import { useGetMyBankAccount } from '../api/bank-account-controller/bank-account-controller';

export function useClientVM() {
  const { data: client, isLoading: isLoadingClient, error: clientError } = useGetClientPersonal();
  const { data: bankAccount, isLoading: isLoadingAccount, error: accountError } = useGetMyBankAccount();

  return {
    client,
    bankAccount,
    isLoading: isLoadingClient || isLoadingAccount,
    errorMessage: clientError || accountError ? 'Error al cargar los datos del cliente' : null,
  };
}