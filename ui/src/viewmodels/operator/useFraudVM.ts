import { useState } from 'react';
import { useGetFraudRecords } from '../../api/fraud-controller/fraud-controller';

export function useFraudVM() {
  const [page, setPage] = useState(0);
  const size = 15;

  const { data: fraudData, isLoading, error } = useGetFraudRecords({
    page,
    size,
    sort: 'detectedAt,desc',
  });

  const formatAmount = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  return {
    records: fraudData?.content || [],
    pageMetadata: fraudData?.page,
    page,
    setPage,
    isLoading,
    error: error ? 'Error al recuperar auditoría de fraude.' : null,
    formatAmount,
  };
}