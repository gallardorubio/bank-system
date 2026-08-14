import { useEffect, useState } from 'react';
import { 
   useGetClientPersonal, 
   useUpdateClientPersonal, 
   useGetMySecurityQuestions, 
   useGetTrustedBankAccounts 
} from '../../api/client-controller/client-controller';
import { customInstance } from '../../api/mutator/instance';
import type { ClientPersonalUpdateRequest } from '../../api/model';

type CognitoJsonResponse = Record<string, any>;

export function useProfileVM() {
  const { data: client, isLoading: isLoadingClient, refetch: refetchClient } = useGetClientPersonal();
  const { data: userQuestions, isLoading: isLoadingQuestions } = useGetMySecurityQuestions();
  const { data: trustedAccounts, isLoading: isLoadingTrusted, refetch: refetchTrusted } = useGetTrustedBankAccounts();
  const updatePersonalMutation = useUpdateClientPersonal();

  const [isEditing, setIsEditing] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);
  const [editErrorMsg, setEditErrorMsg] = useState<string | null>(null);

  const [editForm, setEditForm] = useState({
    name: '',
    phone: '',
    address: '',
    nationality: '',
    birthDate: '',
    email: '',
    questionId: 0,
    answer: '',
  });

  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const [mfaQrUri, setMfaQrUri] = useState<string | null>(null);
  const [mfaSession, setMfaSession] = useState<string | null>(null);
  const [totpCode, setTotpCode] = useState('');
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [mfaSuccessMsg, setMfaSuccessMsg] = useState<string | null>(null);
  const [mfaEnabled, setMfaEnabled] = useState<boolean | null>(null);

  const [statementDates, setEditStatementDates] = useState({ start_date: '', end_date: '' });
  const [isDownloadingStatement, setIsDownloadingStatement] = useState(false);

  const getAccessToken = () => {
    try {
      const oidcKey = `oidc.user:${import.meta.env.VITE_COGNITO_AUTHORITY}:${import.meta.env.VITE_COGNITO_CLIENT_ID}`;
      const oidcData = sessionStorage.getItem(oidcKey);
      if (oidcData) {
        const user = JSON.parse(oidcData);
        return user.access_token;
      }
    } catch (e) {
      console.error('Error obteniendo token OIDC:', e);
    }
    return null;
  };

  const getCognitoEndpoint = () => {
    const authorityUrl = new URL(import.meta.env.VITE_COGNITO_AUTHORITY);
    return authorityUrl.origin;
  };

  const sendCognitoRequest = async <T extends CognitoJsonResponse>(target: string, body: Record<string, unknown>) => {
    const response = await fetch(getCognitoEndpoint(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-amz-json-1.1',
        'X-Amz-Target': `AWSCognitoIdentityProviderService.${target}`,
      },
      body: JSON.stringify(body),
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(payload?.message || payload?.__type || 'Error inesperado en Cognito');
    }

    return payload as T;
  };

  useEffect(() => {
    setMfaEnabled(client?.mfaEnabled ?? null);
  }, [client?.mfaEnabled]);

  const startEditing = () => {
    if (client) {
      setEditForm({
        name: client.name || '',
        phone: client.phone || '',
        address: client.address || '',
        nationality: client.nationality || '',
        birthDate: client.birthDate ? String(client.birthDate) : '',
        email: client.email || '',
        questionId: userQuestions && userQuestions.length > 0 ? userQuestions[0].id || 0 : 0,
        answer: '',
      });
    }
    setEditErrorMsg(null);
    setEditSuccessMsg(null);
    setIsEditing(true);
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setEditForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    setEditErrorMsg(null);
    setEditSuccessMsg(null);
    const payload: ClientPersonalUpdateRequest = {
      name: editForm.name,
      phone: editForm.phone,
      address: editForm.address,
      nationality: editForm.nationality,
      birthDate: editForm.birthDate ? (editForm.birthDate as any) : undefined,
      questionId: Number(editForm.questionId),
      answer: editForm.answer,
    };
    try {
      await updatePersonalMutation.mutateAsync({ data: payload });
      setEditSuccessMsg('Datos actualizados correctamente.');
      setIsEditing(false);
      refetchClient();
    } catch (err: any) {
      setEditErrorMsg(err?.response?.data?.detail || err?.message || 'Error al actualizar datos');
    }
  };

  const handleDeleteTrustedAccount = async (bankAccountId: string) => {
    try {
      await customInstance<void>({
        url: `/api/v1/clients/me/trusted-accounts/${bankAccountId}`,
        method: 'DELETE',
      });
      refetchTrusted();
    } catch (err) {
      console.error('Error borrando cuenta de confianza:', err);
    }
  };

  const associateMFA = async () => {
    if (isMfaLoading) return;
    setIsMfaLoading(true);
    setMfaError(null);
    setMfaSuccessMsg(null);

    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No hay sesión activa');

      const response = await sendCognitoRequest<{ SecretCode?: string; Session?: string }>('AssociateSoftwareToken', {
        AccessToken: accessToken,
      });

      if (response.SecretCode) {
        setMfaSession(response.Session || null);
        const userEmail = client?.email || 'usuario';
        const issuer = 'BankSystem';
        const uri = `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(userEmail)}?secret=${encodeURIComponent(response.SecretCode)}&issuer=${encodeURIComponent(issuer)}`;
        setMfaQrUri(uri);
      } else {
        throw new Error('No se pudo generar el secreto TOTP');
      }
    } catch (err: any) {
      setMfaError(err?.message || 'Error al iniciar configuración MFA');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const verificarYActivarMFA = async (code: string) => {
    if (isMfaLoading) return;
    setIsMfaLoading(true);
    setMfaError(null);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No hay sesión activa');

      const verifyRes = await sendCognitoRequest<{ Status?: 'SUCCESS' | 'ERROR' }>('VerifySoftwareToken', {
        AccessToken: accessToken,
        Session: mfaSession || undefined,
        UserCode: code,
        FriendlyDeviceName: 'Bank System',
      });

      if (verifyRes.Status === 'SUCCESS') {
        await sendCognitoRequest('SetUserMFAPreference', {
          AccessToken: accessToken,
          SoftwareTokenMfaSettings: { Enabled: true, PreferredMfa: true },
        });

        setMfaSuccessMsg('MFA activado correctamente.');
        setMfaQrUri(null);
        setMfaSession(null);
        setTotpCode('');
        setMfaEnabled(true);
        refetchClient();
      } else {
        setMfaError('Código TOTP inválido');
      }
    } catch (err: any) {
      setMfaError(err?.message || 'Código incorrecto');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const desactivarMFA = async () => {
    if (isMfaLoading) return;
    setIsMfaLoading(true);
    setMfaError(null);
    setMfaSuccessMsg(null);
    try {
      const accessToken = getAccessToken();
      if (!accessToken) throw new Error('No hay sesión activa');

      await sendCognitoRequest('SetUserMFAPreference', {
        AccessToken: accessToken,
        SoftwareTokenMfaSettings: { Enabled: false, PreferredMfa: false },
      });

      setMfaSuccessMsg('MFA desactivado correctamente.');
      setMfaQrUri(null);
      setMfaSession(null);
      setTotpCode('');
      setMfaEnabled(false);
      refetchClient();
    } catch (err: any) {
      setMfaError(err?.message || 'Error al desactivar MFA');
    } finally {
      setIsMfaLoading(false);
    }
  };

  const handleDownloadStatement = async () => {
    setIsDownloadingStatement(true);
    try {
      const params = new URLSearchParams();

      if (statementDates.start_date) {
        const startIso = new Date(`${statementDates.start_date}T00:00:00`).toISOString();
        params.append('start_date', startIso);
      }

      if (statementDates.end_date) {
        const endIso = new Date(`${statementDates.end_date}T23:59:59`).toISOString();
        params.append('end_date', endIso);
      }

      const blob = await customInstance<Blob>({
        url: `/api/v1/bank-accounts/me/statement?${params.toString()}`,
        method: 'GET',
        responseType: 'blob',
      });

      const fileNameStart = statementDates.start_date || 'inicio';
      const fileNameEnd = statementDates.end_date || 'hoy';
      const fileName = `informe_cuenta_${fileNameStart}_${fileNameEnd}.pdf`;

      const url = window.URL.createObjectURL(new Blob([blob], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error al descargar extracto:', err);
    } finally {
      setIsDownloadingStatement(false);
    }
  };
  
  return {
    client,
    userQuestions,
    trustedAccounts,
    isLoading: isLoadingClient || isLoadingQuestions || isLoadingTrusted,
    isEditing,
    editForm,
    editSuccessMsg,
    editErrorMsg,
    isSaving: updatePersonalMutation.isPending,
    isMfaLoading,
    isMfaEnabled: mfaEnabled ?? client?.mfaEnabled ?? false,
    mfaQrUri,
    totpCode,
    mfaError,
    mfaSuccessMsg,
    statementDates,
    isDownloadingStatement,
    startEditing,
    cancelEditing: () => { setIsEditing(false); setMfaQrUri(null); },
    handleEditChange,
    handleSavePersonal,
    handleDeleteTrustedAccount,
    associateMFA,
    verificarYActivarMFA,
    desactivarMFA,
    setTotpCode,
    setEditStatementDates,
    handleDownloadStatement,
  };
}