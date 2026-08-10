import type { HTMLAttributes } from 'react';
import { cn } from '../lib/utils';

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('bg-white rounded-[28px] p-6 border border-[#E2E8F0] shadow-[0_2px_12px_rgba(10,37,64,0.03)]', className)}
      {...props}
    />
  );
}