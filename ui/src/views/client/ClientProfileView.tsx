import countries from 'i18n-iso-countries';
import esLocale from 'i18n-iso-countries/langs/es.json';
import { getCountries, getCountryCallingCode } from 'libphonenumber-js';
import { QRCodeSVG } from 'qrcode.react';
import { useProfileVM } from '../../viewmodels/useProfileVM';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { 
  Loader2, 
  ShieldCheck, 
  ShieldAlert, 
  Trash2, 
  Download, 
  UserPen, 
  Lock,
  Building 
} from 'lucide-react';

countries.registerLocale(esLocale);

const countryList = getCountries().map((code) => ({
  code,
  name: countries.getName(code, 'es', { select: 'official' }) || code,
  callingCode: `+${getCountryCallingCode(code)}`,
})).sort((a, b) => a.name.localeCompare(b.name));

export function ClientProfileView() {
  const vm = useProfileVM();

  if (vm.isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <span className="text-sm font-bold uppercase tracking-widest text-[#0066FF] animate-pulse">
          Cargando perfil...
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 w-full pb-12">
      <div>
        <span className="text-sm text-[#627D98] font-bold uppercase tracking-widest">CONFIGURACIÓN</span>
        <h1 className="text-5xl font-black text-[#0A2540] tracking-tighter mt-3">Mi Perfil</h1>
      </div>

      {/* 1. INFORMACIÓN PERSONAL */}
      <Card className="p-8 w-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <UserPen className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-[#0A2540]">Información personal</h2>
          </div>
          {!vm.isEditing && (
            <Button variant="secondary" onClick={vm.startEditing} className="gap-2 px-5 py-2.5 text-sm font-bold cursor-pointer">
              Editar datos
            </Button>
          )}
        </div>

        {vm.editSuccessMsg && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-700 text-sm font-bold border border-emerald-100">
            {vm.editSuccessMsg}
          </div>
        )}

        {vm.isEditing ? (
          <form onSubmit={vm.handleSavePersonal} className="space-y-4">
            {vm.editErrorMsg && (
              <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-bold border border-red-100">
                {vm.editErrorMsg}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Nombre completo" type="text" name="name" value={vm.editForm.name} onChange={vm.handleEditChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
              <input placeholder="Correo electrónico" type="email" disabled name="email" value={vm.editForm.email} onChange={vm.handleEditChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-slate-100 text-sm font-semibold text-slate-400 cursor-not-allowed" />
              <input placeholder="Tax ID" type="text" value={vm.client?.taxId || ''} disabled className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-slate-100 text-sm font-semibold text-slate-400 cursor-not-allowed" />
              <input placeholder="Teléfono" type="tel" name="phone" value={vm.editForm.phone} onChange={vm.handleEditChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
              <input placeholder="Dirección" type="text" name="address" value={vm.editForm.address} onChange={vm.handleEditChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
              
              <select name="nationality" value={vm.editForm.nationality} onChange={vm.handleEditChange} required className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF] cursor-pointer">
                <option value="" disabled>Selecciona nacionalidad</option>
                {countryList.map(c => (
                  <option key={c.code} value={c.name}>{c.name}</option>
                ))}
              </select>

              <input type="date" name="birthDate" value={vm.editForm.birthDate} onChange={vm.handleEditChange} required className="col-span-2 h-11 px-4 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold text-[#0A2540] outline-none focus:bg-white focus:border-[#0066FF]" />
            </div>

            <div className="p-6 rounded-2xl bg-[#F0F4F9] border border-[#E2E8F0] space-y-3 mt-6">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0A2540]">
                <Lock className="w-4 h-4 text-[#0066FF]" /> Validación de identidad requerida
              </div>
              <p className="text-xs text-[#627D98]">Selecciona una de tus preguntas de seguridad e introduce tu respuesta para autorizar los cambios.</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <select name="questionId" value={vm.editForm.questionId} onChange={vm.handleEditChange} required className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0A2540] outline-none focus:border-[#0066FF] cursor-pointer">
                  {vm.userQuestions?.map(q => (
                    <option key={q.id} value={q.id}>
                      {q.question}
                    </option>
                  ))}
                </select>
                <input placeholder="Respuesta" type="password" name="answer" value={vm.editForm.answer} onChange={vm.handleEditChange} required className="h-11 px-4 rounded-xl border border-[#E2E8F0] bg-white text-sm font-semibold text-[#0A2540] outline-none focus:border-[#0066FF]" />
              </div>
            </div>

            <div className="flex gap-4 pt-4 justify-end">
              <Button type="button" variant="ghost" onClick={vm.cancelEditing} className="px-6 py-3 text-sm font-bold cursor-pointer">
                Cancelar
              </Button>
              <Button type="submit" disabled={vm.isSaving} className="px-8 py-3 text-sm font-bold shadow-sm cursor-pointer">
                {vm.isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Guardar cambios'}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Nombre completo</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.name || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Correo electrónico</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.email || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Tax ID</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.taxId || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Teléfono</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.phone || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Dirección</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.address || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Nacionalidad</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.nationality || 'N/A'}</span>
            </div>
            <div className="bg-[#F0F4F9] p-5 rounded-2xl col-span-2">
              <span className="text-[#627D98] block mb-1 text-xs font-bold">Fecha de nacimiento</span>
              <span className="font-bold text-[#0A2540] text-base">{vm.client?.birthDate || 'N/A'}</span>
            </div>
          </div>
        )}
      </Card>

      {/* 2. AUTENTICACIÓN MULTIFACTOR (MFA) */}
      <Card className="p-8 w-full border border-[#E2E8F0]">
        <div className={`flex items-center justify-between gap-4 ${(vm.mfaError || vm.mfaSuccessMsg || vm.mfaQrUri) ? 'mb-5' : ''}`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vm.isMfaEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-[#627D98]'}`}>
              {vm.isMfaEnabled ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <h2 className="text-xl font-black text-[#0A2540]">Autenticación multifactor (MFA)</h2>
          </div>

          {!vm.isMfaEnabled && !vm.mfaQrUri && (
            <Button 
              variant="primary" 
              disabled={vm.isMfaLoading} 
              onClick={vm.associateMFA} 
              className="px-5 py-2.5 text-sm font-bold cursor-pointer"
            >
              {vm.isMfaLoading ? 'Cargando...' : 'Configurar MFA'}
            </Button>
          )}
          
          {vm.isMfaEnabled && (
            <Button 
              onClick={vm.desactivarMFA} 
              disabled={vm.isMfaLoading}
              variant="secondary"
              className="px-5 py-2.5 text-sm font-bold cursor-pointer"
            >
              {vm.isMfaLoading ? 'Cargando...' : 'Desactivar MFA'}
            </Button>
          )}
        </div>

        {(vm.mfaError || vm.mfaSuccessMsg) && (
          <div className="mb-4 space-y-3">
            {vm.mfaError && <div className="p-3 text-sm bg-red-50 text-red-600 rounded-xl font-bold">{vm.mfaError}</div>}
            {vm.mfaSuccessMsg && <div className="p-3 text-sm bg-emerald-50 text-emerald-600 rounded-xl font-bold">{vm.mfaSuccessMsg}</div>}
          </div>
        )}

        {vm.mfaQrUri && (
          <div className="p-6 rounded-2xl bg-[#F0F4F9] border border-[#E2E8F0] flex flex-col md:flex-row gap-6 items-start max-w-xl">
            <div className="bg-white p-4 rounded-xl border border-[#E2E8F0]">
              <QRCodeSVG value={vm.mfaQrUri} size={140} />
            </div>
            
            <div className="flex-1 space-y-4 pt-1">
              <p className="text-sm font-semibold leading-6 text-[#627D98]">
                Escanea el código QR e introduce el código.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <input 
                  placeholder="000000" 
                  type="text" 
                  maxLength={6}
                  value={vm.totpCode}
                  onChange={(e) => vm.setTotpCode(e.target.value)}
                  className="h-11 w-full sm:w-40 text-center rounded-xl border border-[#E2E8F0] bg-white text-sm font-bold text-[#0A2540] outline-none px-4"
                />
                <Button 
                  onClick={() => vm.verificarYActivarMFA(vm.totpCode)} 
                  disabled={vm.isMfaLoading}
                  variant="primary"
                  className="w-full sm:w-auto px-5"
                >
                  {vm.isMfaLoading ? '...' : 'Confirmar'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 3. CUENTAS DE CONFIANZA */}
      <Card className="p-8 w-full">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
            <Building className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-black text-[#0A2540]">Cuentas de confianza</h2>
        </div>

        {vm.trustedAccounts && vm.trustedAccounts.length > 0 ? (
          <div className="space-y-3">
            {vm.trustedAccounts.map(acc => (
              <div key={acc.bankAccountId} className="flex items-center justify-between p-4 rounded-2xl bg-[#F0F4F9] border border-[#E2E8F0]">
                <div>
                  <p className="text-sm font-bold text-[#0A2540]">{acc.clientName || 'Beneficiario'}</p>
                  <p className="text-xs font-mono text-[#627D98] mt-0.5">{acc.bankAccountId}</p>
                </div>
                <button onClick={() => vm.handleDeleteTrustedAccount(acc.bankAccountId!)} className="p-2 text-[#627D98] hover:text-red-500 transition-colors cursor-pointer">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-[#627D98] font-semibold">No tienes cuentas de confianza guardadas.</p>
        )}
      </Card>

      {/* 4. EXTRACTOS BANCARIOS */}
      <Card className="p-8 w-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F0FE] flex items-center justify-center text-[#0066FF]">
              <Download className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-black text-[#0A2540]">Informe de cuenta</h2>
          </div>

          <div className="flex gap-3 items-center">
            <input type="date" value={vm.statementDates.start_date} onChange={e => vm.setEditStatementDates(prev => ({ ...prev, start_date: e.target.value }))} className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold outline-none" />
            <input type="date" value={vm.statementDates.end_date} onChange={e => vm.setEditStatementDates(prev => ({ ...prev, end_date: e.target.value }))} className="h-11 px-3 rounded-xl border border-[#E2E8F0] bg-[#F0F4F9] text-sm font-semibold outline-none" />
            <Button onClick={vm.handleDownloadStatement} disabled={vm.isDownloadingStatement} className="gap-2 px-6 py-3 text-sm font-bold cursor-pointer">
              {vm.isDownloadingStatement ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Descargar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}