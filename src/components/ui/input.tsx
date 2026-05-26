"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={id}
            className="block text-[11px] font-semibold tracking-[0.14em] uppercase text-[var(--color-on-surface-variant)]"
          >
            {label}
          </label>
        )}
        <input
          id={id}
          ref={ref}
          className={cn(
            "w-full rounded-lg border bg-[var(--color-surface-container-low)] px-4 py-3 text-[14px] text-[var(--color-on-surface)] placeholder:text-[var(--color-on-surface-variant)]/50 transition-colors focus:outline-none focus:ring-2",
            error
              ? "border-[var(--color-error)]/60 focus:ring-[var(--color-error)]/30 focus:border-[var(--color-error)]"
              : "border-[var(--color-outline-variant)]/40 focus:ring-[var(--color-primary)]/40 focus:border-[var(--color-primary)]",
            className
          )}
          {...props}
        />
        {error && <p className="text-[12px] text-[var(--color-error)]">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
