import { useRegisterVM } from '../viewmodels/useRegisterVM';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { Loader2 } from 'lucide-react';

interface RegisterViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function RegisterView({ onSuccess, onCancel }: RegisterViewProps) {
  const vm = useRegisterVM(onSuccess);

  if (vm.isLoadingQuestions) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F0F4F9]">
        <Loader2 className="h-6 w-6 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-[#F0F4F9] flex items-center justify-center p-4 overflow-hidden">
      <Card className="w-full max-w-2xl p-6 shadow-sm border border-[#E2E8F0]">
        <div className="mb-4">
          <h2 className="text-2xl font-black text-[#0A2540]">Crear cuenta en BankSystem</h2>
          <p className="text-xs text-[#627D98]">Introduce tus datos personales y preguntas de seguridad</p>
        </div>

        {vm.errorMessage && (
          <div className="mb-3 rounded-xl bg-red-50 p-2.5 text-xs font-medium text-red-600 border border-red-100">
            {vm.errorMessage}
          </div>
        )}

        <form onSubmit={vm.handleSubmit} className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2.5 text-xs">
            <input placeholder="Nombre completo" type="text" name="name" value={vm.formData.name} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="Correo electrónico" type="email" name="email" value={vm.formData.email} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="DNI / Tax ID" type="text" name="taxId" value={vm.formData.taxId} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="Teléfono" type="tel" name="phone" value={vm.formData.phone} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="Dirección" type="text" name="address" value={vm.formData.address} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="Nacionalidad" type="text" name="nationality" value={vm.formData.nationality} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input type="date" name="birthDate" value={vm.formData.birthDate} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
            <input placeholder="Contraseña" type="password" name="password" value={vm.formData.password} onChange={vm.handleChange} required className="h-9 px-3 rounded-xl border border-[#E2E8F0] bg-white outline-none focus:border-[#0066FF]" />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-1">
            {[1, 2, 3].map((num) => {
              const qIdKey = `q${num}Id` as keyof typeof vm.formData;
              const qAnsKey = `q${num}Answer` as keyof typeof vm.formData;

              return (
                <div key={num} className="flex flex-col gap-1">
                  <select name={qIdKey} value={vm.formData[qIdKey]} onChange={vm.handleChange} className="h-8 px-2 rounded-lg border border-[#E2E8F0] bg-white text-[11px] outline-none">
                    {vm.questionsCatalog?.map((q) => (
                      <option key={q.id} value={q.id}>{q.question}</option>
                    ))}
                  </select>
                  <input placeholder={`Respuesta ${num}`} type="text" name={qAnsKey} value={vm.formData[qAnsKey]} onChange={vm.handleChange} required className="h-8 px-2 rounded-lg border border-[#E2E8F0] bg-white text-[11px] outline-none" />
                </div>
              );
            })}
          </div>

          <div className="flex gap-2 pt-3 border-t border-[#E2E8F0] mt-1">
            <Button type="submit" disabled={vm.isSubmitting} className="flex-1 h-9 text-xs">
              {vm.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Confirmar registro'}
            </Button>
            <Button type="button" variant="ghost" onClick={onCancel} className="h-9 text-xs">
              Cancelar
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}