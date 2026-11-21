import { Slot } from '@radix-ui/react-slot';
import { cva } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-sm)] text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--admin-primary)] disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--admin-primary)] text-[#031216] shadow-[0_12px_30px_rgba(0,217,255,0.24)] hover:brightness-95',
        accent:
          'bg-[var(--admin-accent)] text-white shadow-[0_12px_30px_rgba(255,31,143,0.22)] hover:brightness-95',
        outline:
          'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-[var(--admin-foreground)] hover:border-[var(--admin-primary)]',
        ghost:
          'text-[var(--admin-muted)] hover:bg-[var(--admin-soft)] hover:text-[var(--admin-foreground)]',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
      },
      size: {
        sm: 'h-9 px-3',
        md: 'h-10 px-4',
        lg: 'h-12 px-5',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export function Button({ className, variant, size, asChild = false, ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
