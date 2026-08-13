import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  label?: string;
}

export function LoadingScreen({ label = 'Cargando' }: LoadingScreenProps) {
  return (
    <div className="flex h-full w-full items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#0066FF]" />
        <span className="text-xs font-bold tracking-wider uppercase text-[#627D98]">
          {label}
        </span>
      </div>
    </div>
  );
}