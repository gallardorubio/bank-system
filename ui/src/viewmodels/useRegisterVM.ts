import { useState } from 'react';
import { 
  useCreateClient, 
  useGetSecurityQuestionsCatalog 
} from '../api/client-controller/client-controller';
import type { ClientRequest } from '../api/model';

export function useRegisterVM(onSuccess?: () => void) {
  const { data: questionsCatalog, isLoading: isLoadingQuestions } = useGetSecurityQuestionsCatalog();
  const createClientMutation = useCreateClient();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    nationality: '',
    birthDate: '',
    email: '',
    taxId: '',
    password: '',
    q1Id: 1,
    q1Answer: '',
    q2Id: 2,
    q2Answer: '',
    q3Id: 3,
    q3Answer: '',
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validación local del requisito de 3 preguntas únicas
    const selectedQuestions = [Number(formData.q1Id), Number(formData.q2Id), Number(formData.q3Id)];
    const uniqueQuestions = new Set(selectedQuestions);
    if (uniqueQuestions.size !== 3) {
      setErrorMessage('Debes seleccionar 3 preguntas de seguridad diferentes.');
      return;
    }

    const payload: ClientRequest = {
      name: formData.name,
      phone: formData.phone,
      address: formData.address,
      nationality: formData.nationality,
      birthDate: formData.birthDate,
      email: formData.email,
      taxId: formData.taxId,
      password: formData.password,
      securityQuestionAnswers: [
        { questionId: Number(formData.q1Id), answer: formData.q1Answer },
        { questionId: Number(formData.q2Id), answer: formData.q2Answer },
        { questionId: Number(formData.q3Id), answer: formData.q3Answer },
      ],
    };

    try {
      await createClientMutation.mutateAsync({ data: payload });
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.message || 'Error al registrar cliente';
      setErrorMessage(msg);
    }
  };

  return {
    formData,
    questionsCatalog,
    isLoadingQuestions,
    isSubmitting: createClientMutation.isPending,
    errorMessage,
    handleChange,
    handleSubmit,
  };
}