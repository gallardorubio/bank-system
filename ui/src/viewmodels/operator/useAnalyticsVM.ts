import { useGetAnalytics } from '../../api/bank-account-controller/bank-account-controller';

export function useOperatorAnalyticsVM() {
  const { data: analytics, isLoading, isFetching, error } = useGetAnalytics();

  const formatAmount = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toFixed(2);
  };

  const vault = analytics?.vaultBalance ?? 0;
  const clientBalance = analytics?.totalClientBalance ?? 0;
  const totalFunds = vault + clientBalance;
  const reserveCoverageRatio = totalFunds > 0 ? (vault / totalFunds) * 100 : 0;

  return {
    analytics,
    isLoading,
    isFetching,
    error: error ? 'No se pudieron recuperar las métricas analíticas.' : null,
    formatAmount,
    reserveCoverageRatio,
  };
}