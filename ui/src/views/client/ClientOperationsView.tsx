import { Card } from '../../components/Card';

export function ClientOperationsView() {
  return (
    <div className="flex flex-col gap-6 max-w-5xl">
      <Card className="p-8">
        <h2 className="text-2xl font-black text-[#0A2540] mb-2">Movimientos y Operaciones</h2>
        <p className="text-sm text-[#627D98]">Historial de depósitos, transferencias y préstamos activos.</p>
      </Card>
    </div>
  );
}