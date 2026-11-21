'use client';

import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { cn } from '@/lib/utils';

export const DropdownMenu = DropdownMenuPrimitive.Root;
export const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

export function DropdownMenuContent({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Portal>
      <DropdownMenuPrimitive.Content
        align="end"
        sideOffset={10}
        className={cn(
          'z-50 min-w-48 rounded-[var(--radius-md)] border border-[var(--admin-border)] bg-[var(--admin-surface)] p-1 shadow-[0_18px_60px_rgba(7,18,23,0.16)]',
          className
        )}
        {...props}
      />
    </DropdownMenuPrimitive.Portal>
  );
}

export function DropdownMenuItem({ className, ...props }) {
  return (
    <DropdownMenuPrimitive.Item
      className={cn(
        'flex cursor-pointer items-center gap-2 rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--admin-foreground)] outline-none transition hover:bg-[var(--admin-soft)] focus:bg-[var(--admin-soft)]',
        className
      )}
      {...props}
    />
  );
}
