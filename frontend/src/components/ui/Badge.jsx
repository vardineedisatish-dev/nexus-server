import { cn } from '@/lib/utils';

const variantMap = {
  default: 'bg-slate-100 text-slate-700',
  success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border border-rose-200',
  info: 'bg-blue-50 text-blue-700 border border-blue-200',
};

export function Badge({ children, className, variant = 'default' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
        variantMap[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
