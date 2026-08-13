import { useState, useEffect } from 'react';
import { useGetMySecurityQuestions, useUnlockAccount } from '../api/client-controller/client-controller';
import { Button } from './Button';
import { Loader2, CheckCircle2 } from 'lucide-react';

interface UnlockModalProps {
  isOpen: boolean;
  onUnlocked: () => void;
}

export function UnlockModal({ isOpen, onUnlocked }: UnlockModalProps) {
  const { data: questions, isLoading: isLoadingQuestions } = useGetMySecurityQuestions({
    query: { enabled: isOpen }
  });
  const unlockMutation = useUnlockAccount();

  const [selectedQuestionId, setSelectedQuestionId] = useState<number>(0);
  const [answer, setAnswer] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAnswer('');
      setErrorMsg(null);
      setSuccess(false);
      if (questions && questions.length > 0) {
        setSelectedQuestionId(questions[0].id!);
      }
    }
  }, [isOpen, questions]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!answer.trim()) {
      setErrorMsg('Por favor, introduce una respuesta.');
      return;
    }

    try {
      await unlockMutation.mutateAsync({
        data: {
          answers: [
            {
              questionId: Number(selectedQuestionId),
              answer: answer.trim(),
            },
          ],
        },
      });
      setSuccess(true);
      setTimeout(() => {
        onUnlocked();
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.detail || err?.message || 'Respuesta de seguridad incorrecta.');
    }
  };

  const currentQuestion = questions?.find(q => q.id === Number(selectedQuestionId));

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col justify-between p-8 md:p-12 animate-in fade-in duration-150 overflow-y-auto">
      <div className="relative flex items-center justify-center w-full pt-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-[#0A2540] uppercase tracking-widest">
            Verificación de Seguridad
          </span>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center max-w-2xl mx-auto w-full my-auto gap-8 pt-12 pb-12">
        {success ? (
          <div className="bg-[#E8F0FE] border border-[#0066FF]/20 p-8 rounded-[32px] text-center space-y-3 w-full">
            <CheckCircle2 className="w-12 h-12 text-[#0066FF] mx-auto" />
            <h3 className="text-2xl font-black text-[#0A2540]">¡Cuenta desbloqueada con éxito!</h3>
            <p className="text-sm text-[#627D98]">Restaurando sesión...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} id="unlock-form" className="w-full space-y-6">
            <div className="bg-[#F0F4F9] p-8 rounded-[36px] border border-[#E2E8F0] space-y-6">
              <p className="text-sm font-semibold text-[#627D98]">
                Tu cuenta ha sido bloqueada. Responde correctamente y se desbloqueará.
              </p>

              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 text-red-600 text-xs font-bold border border-red-100">
                  {errorMsg}
                </div>
              )}

              {isLoadingQuestions ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0066FF]" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0A2540] block">Selecciona la pregunta</label>
                    <select
                      value={selectedQuestionId}
                      onChange={(e) => setSelectedQuestionId(Number(e.target.value))}
                      className="w-full h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0A2540] outline-none focus:border-[#0066FF] cursor-pointer"
                    >
                      {questions?.map((q) => (
                        <option key={q.id} value={q.id}>
                          {q.question}
                        </option>
                      ))}
                    </select>
                  </div>

                  {currentQuestion && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-[#0A2540] block">Tu respuesta</label>
                      <input
                        type="password"
                        required
                        placeholder="Escribe tu respuesta..."
                        value={answer}
                        onChange={(e) => setAnswer(e.target.value)}
                        className="w-full h-12 px-4 rounded-2xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0A2540] outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="w-full max-w-2xl mx-auto flex gap-4 pb-4">
        {!success && (
          <Button
            form="unlock-form"
            type="submit"
            disabled={unlockMutation.isPending || isLoadingQuestions}
            className="w-full py-4 text-base font-bold shadow-sm cursor-pointer"
          >
            {unlockMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Desbloquear Cuenta'}
          </Button>
        )}
      </div>
    </div>
  );
}