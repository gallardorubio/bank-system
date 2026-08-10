import { Card } from '../components/Card';

export function OperatorView() {
  return (
    <div className="flex flex-col gap-6">
      <Card className="p-8">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0066FF]">Backoffice</span>
        <h1 className="text-2xl font-black text-[#0A2540] mt-1 mb-2">Panel Operativo</h1>
        <p className="text-xs text-[#627D98] leading-relaxed">
          Módulo de revisión general de solicitudes escaladas y auditoría de la plataforma.
        </p>
      </Card>
    </div>
  );
}