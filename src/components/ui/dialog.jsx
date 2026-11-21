'use client';

import * as DialogPrimitive from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

export function DialogContent({ className, children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-md transition-all duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
      <DialogPrimitive.Content
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        className={cn(
          'fixed left-1/2 top-1/2 z-50 flex flex-col max-h-[92vh] w-[min(980px,calc(100vw-32px))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-[var(--admin-border)] bg-[var(--admin-surface)] p-0 shadow-[0_28px_85px_rgba(7,18,23,0.35)] ring-1 ring-[var(--admin-primary)]/15 outline-none transition-all duration-200 overflow-hidden',
          className
        )}
        {...props}
      >
        <DialogPrimitive.Title className="sr-only">Dialog</DialogPrimitive.Title>
        <DialogPrimitive.Description className="sr-only">Modal Dialog</DialogPrimitive.Description>
        {children}
        <DialogPrimitive.Close
          className="absolute right-4 top-4 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-[var(--admin-soft)] text-[var(--admin-muted)] transition-colors hover:bg-[var(--admin-primary)]/15 hover:text-[var(--admin-primary)] focus:outline-none"
          aria-label="Close dialog"
        >
          <X size={18} />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogHeader({ className, ...props }) {
  return <div className={cn('shrink-0 border-b border-[var(--admin-border)] bg-[var(--admin-surface)] px-7 py-5 pr-16', className)} {...props} />;
}

export function DialogBody({ className, ...props }) {
  return <div className={cn('flex-1 overflow-y-auto px-7 py-6 admin-modal-scroll', className)} {...props} />;
}

export function DialogFooter({ className, ...props }) {
  return <div className={cn('shrink-0 flex items-center justify-end gap-3 border-t border-[var(--admin-border)] bg-[var(--admin-soft)]/40 px-7 py-4', className)} {...props} />;
}

export function DialogTitle({ className, ...props }) {
  return (
    <DialogPrimitive.Title
      className={cn('font-display text-xl font-bold tracking-tight text-[var(--admin-foreground)]', className)}
      {...props}
    />
  );
}

export function DialogDescription({ className, ...props }) {
  return (
    <DialogPrimitive.Description
      className={cn('mt-1 text-sm text-[var(--admin-muted)] leading-relaxed', className)}
      {...props}
    />
  );
}
