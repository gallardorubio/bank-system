import { useState, useMemo } from 'react';
import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { useRegisterVM } from '../viewmodels/useRegisterVM';
import { Button } from '../components/Button';
import { Loader2, Check, X } from 'lucide-react';

countries.registerLocale(esLocale);

const countryList = getCountries().map((code) => ({
  code,
  name: countries.getName(code, 'es', { select: 'official' }) || code,
  callingCode: `+${getCountryCallingCode(code)}`,
})).sort((a, b) => a.name.localeCompare(b.name));

interface RegisterViewProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function RegisterView({ onSuccess, onCancel }: RegisterViewProps) {
  const vm = useRegisterVM(onSuccess);

  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedCountryCode, setSelectedCountryCode] = useState('ES');
  const [phoneNational, setPhoneNational] = useState('');

  const currentCallingCode = `+${getCountryCallingCode(selectedCountryCode as any)}`;

  const passwordChecks = useMemo(() => {
    const p = vm.formData.password;
    return {
      length: p.length >= 8,
      number: /[0-9]/.test(p),
      lowercase: /[a-z]/.test(p),
      uppercase: /[A-Z]/.test(p),
      special: /[@#$%^&+=!.]/.test(p),
    };
  }, [vm.formData.password]);

  const allChecksPassed = Object.values(passwordChecks).every(Boolean);
  const passwordsMatch = vm.formData.password === confirmPassword && confirmPassword.length > 0;

  const handlePhoneInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhoneNational(raw);
    vm.handleChange({
      target: { name: 'phone', value: `${currentCallingCode}${raw}` },
    } as any);
  };

  const handleCountryPhoneChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    setSelectedCountryCode(code);
    const newCallingCode = `+${getCountryCallingCode(code as any)}`;
    vm.handleChange({
      target: { name: 'phone', value: `${newCallingCode}${phoneNational}` },
    } as any);
  };

  if (vm.isLoadingQuestions) {
    return (
      <div className="flex h-full w-full items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
      </div>
    );
  }

  return (
    <div className="p-12 flex flex-col justify-between overflow-y-auto h-full">
      <div>
        <h1 className="text-4xl font-black text-[#0A2540] tracking-tight mb-2">Crear cuenta</h1>
        <p className="text-sm text-[#627D98] mb-8">
          <span className="text-[#0066FF] font-semibold">Todos los campos son obligatorios</span> • Ingresa tus datos de cliente.
        </p>

        {vm.errorMessage && (
          <div className="mb-4 rounded-xl bg-red-50 p-3 text-xs font-semibold text-red-600 border border-red-100">
            {vm.errorMessage}
          </div>
        )}

        <form id="register-form" onSubmit={vm.handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Nombre completo" type="text" name="name" value={vm.formData.name} onChange={vm.handleChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
            <input placeholder="Correo electrónico" type="email" name="email" value={vm.formData.email} onChange={vm.handleChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
            <input placeholder="DNI / Tax ID" type="text" name="taxId" value={vm.formData.taxId} onChange={vm.handleChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
            
            <div className="flex h-11 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] overflow-hidden focus-within:bg-white focus-within:border-[#0066FF]">
              <select value={selectedCountryCode} onChange={handleCountryPhoneChange} className="px-2 bg-transparent text-sm font-bold text-[#0A2540] outline-none border-r border-[#E2E8F0] cursor-pointer">
                {countryList.map(c => (
                  <option key={c.code} value={c.code}>{c.code} ({c.callingCode})</option>
                ))}
              </select>
              <input placeholder="Teléfono" type="tel" value={phoneNational} onChange={handlePhoneInput} required className="w-full px-3 text-sm font-semibold text-[#0A2540] outline-none bg-transparent" />
            </div>

            <input placeholder="Dirección" type="text" name="address" value={vm.formData.address} onChange={vm.handleChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />

            <select name="nationality" value={vm.formData.nationality} onChange={vm.handleChange} required className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF] cursor-pointer">
              <option value="" disabled>Selecciona nacionalidad</option>
              {countryList.map(c => (
                <option key={c.code} value={c.name}>{c.name}</option>
              ))}
            </select>

            <input type="date" name="birthDate" value={vm.formData.birthDate} onChange={vm.handleChange} required className="col-span-2 h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <input placeholder="Contraseña" type="password" name="password" value={vm.formData.password} onChange={vm.handleChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
            <input placeholder="Repite la contraseña" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
          </div>

          <div className="bg-[#F0F4F9] p-3.5 rounded-xl border border-[#E2E8F0] grid grid-cols-2 gap-2 text-xs">
            <div className={`flex items-center gap-1.5 ${passwordChecks.length ? 'text-emerald-600 font-bold' : 'text-[#627D98]'}`}>
              {passwordChecks.length ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Mínimo 8 caracteres
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.uppercase ? 'text-emerald-600 font-bold' : 'text-[#627D98]'}`}>
              {passwordChecks.uppercase ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Una mayúscula
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.number ? 'text-emerald-600 font-bold' : 'text-[#627D98]'}`}>
              {passwordChecks.number ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Un número
            </div>
            <div className={`flex items-center gap-1.5 ${passwordChecks.special ? 'text-emerald-600 font-bold' : 'text-[#627D98]'}`}>
              {passwordChecks.special ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Un carácter especial (@#$%^&+=!.)
            </div>
            <div className={`col-span-2 flex items-center gap-1.5 pt-2 border-t border-[#E2E8F0] ${passwordsMatch ? 'text-emerald-600 font-bold' : 'text-[#627D98]'}`}>
              {passwordsMatch ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} Las contraseñas coinciden
            </div>
          </div>

          <div className="mt-8 mb-2">
            <h3 className="text-sm font-bold text-[#0A2540] mb-3">Preguntas de seguridad</h3>
            <div className="space-y-3">
              {[1, 2, 3].map(num => {
                const qIdKey = `q${num}Id` as keyof typeof vm.formData;
                const qAnsKey = `q${num}Answer` as keyof typeof vm.formData;
                const currentSelectedId = Number(vm.formData[qIdKey]);

                const availableQuestions = vm.questionsCatalog?.filter(
                  q => q.id === currentSelectedId || !vm.selectedQuestionIds.includes(q.id!)
                );

                return (
                  <div key={num} className="grid grid-cols-2 gap-3">
                    <select 
                      name={qIdKey} 
                      value={currentSelectedId} 
                      onChange={vm.handleChange} 
                      className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF] cursor-pointer"
                    >
                      {availableQuestions?.map(q => (
                        <option key={q.id} value={q.id}>
                          {q.question}
                        </option>
                      ))}
                    </select>
                    <input 
                      placeholder={`Respuesta ${num}`} 
                      type="text" 
                      name={qAnsKey} 
                      value={vm.formData[qAnsKey]} 
                      onChange={vm.handleChange} 
                      required 
                      className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" 
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </form>
      </div>

      <div className="flex gap-4 mt-8">
        <Button form="register-form" type="submit" disabled={vm.isSubmitting || !allChecksPassed || !passwordsMatch} className="flex-1 py-4 text-base font-bold shadow-sm">
          {vm.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Completar registro'}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel} className="py-4 text-base font-bold">
          Cancelar
        </Button>
      </div>
    </div>
  );
}