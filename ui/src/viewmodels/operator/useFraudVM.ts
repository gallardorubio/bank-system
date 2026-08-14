import { useState } from 'react';
import { useGetFraudRecords } from '../../api/fraud-controller/fraud-controller';
import { customInstance } from '../../api/mutator/instance';
import type { FraudEntity } from '../../api/model';

export function useFraudVM() {
  const [page, setPage] = useState(0);
  const size = 15;
  const { data: fraudData, isLoading, error } = useGetFraudRecords({
    page,
    size,
    sort: 'detectedAt,desc',
  });

  const [selectedRecord, setSelectedRecord] = useState<FraudEntity | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDownloadingAccountDoc, setIsDownloadingAccountDoc] = useState(false);

  const formatAmount = (value?: number): string => {
    if (value === undefined || value === null || isNaN(value)) return '0.00';
    return value.toFixed(2);
  };

  const handleRowClick = (record: FraudEntity) => {
    setSelectedRecord(record);
    setIsDetailsModalOpen(true);
  };

  const closeDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedRecord(null);
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
    records: fraudData?.content || [],
    pageMetadata: fraudData?.page,
    page,
    setPage,
    isLoading,
    error: error ? 'Error al recuperar auditoría de fraude.' : null,
    formatAmount,
    selectedRecord,
    isDetailsModalOpen,
    isDownloadingAccountDoc,
    handleRowClick,
    closeDetailsModal,
    handleDownloadAccountStatement,
  };
}