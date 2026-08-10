import { useGetClientPersonal } from '../api/client-controller/client-controller';

export function useUserVM() {
  const { data: client, isLoading, error, refetch } = useGetClientPersonal();

  return {
    client,
    isLoading,
    errorMessage: error ? 'Error al cargar los datos del usuario' : null,
    refetch,
  };
}