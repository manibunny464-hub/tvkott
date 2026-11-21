import { cn } from '@/lib/utils';

const toneClass = {
  cyan: 'bg-cyan-50 text-cyan-700 ring-cyan-200',
  pink: 'bg-pink-50 text-pink-700 ring-pink-200',
  amber: 'bg-amber-50 text-amber-700 ring-amber-200',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  red: 'bg-rose-50 text-rose-700 ring-rose-200',
  gray: 'bg-slate-100 text-slate-700 ring-slate-200',
};

export function Badge({ className, tone = 'gray', ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1',
        toneClass[tone] || toneClass.gray,
        className
      )}
      {...props}
    />
  );
}
