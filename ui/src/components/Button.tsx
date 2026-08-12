import type { ButtonHTMLAttributes } from 'react';
import { cn } from '../lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'dark' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center font-bold rounded-2xl transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none cursor-pointer';
  const variants = {
    primary: 'bg-[#0066FF] hover:bg-[#0052CC] text-white shadow-sm',
    secondary: 'bg-[#E8F0FE] hover:bg-[#D0E2FF] text-[#0066FF]',
    dark: 'bg-[#0A2540] hover:bg-[#081C33] text-white',
    ghost: 'bg-transparent hover:bg-[#F0F4F9] text-[#0A2540]',
  };
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-5 py-3 text-sm',
    lg: 'px-6 py-4 text-base',
  };

  return <button className={cn(base, variants[variant], sizes[size], className)} {...props} />;
}