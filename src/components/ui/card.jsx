import { cn } from '@/lib/utils';

export function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-md)] border border-[var(--admin-border)] bg-[var(--admin-surface)] shadow-[0_16px_50px_rgba(7,18,23,0.07)]',
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn('p-5 pb-3', className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return (
    <h2
      className={cn('font-display text-lg font-semibold text-[var(--admin-foreground)]', className)}
      {...props}
    />
  );
}

export function CardContent({ className, ...props }) {
  return <div className={cn('p-5 pt-2', className)} {...props} />;
}
