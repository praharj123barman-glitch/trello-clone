"use client";

import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:
        "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:bg-[var(--color-primary-fixed)] btn-shimmer shadow-[0_4px_14px_-4px_rgba(192,193,255,0.35)]",
      secondary:
        "bg-[var(--color-secondary)] text-[var(--color-on-secondary)] hover:opacity-90",
      ghost:
        "bg-transparent hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]",
      danger:
        "bg-[var(--color-error)] text-[var(--color-on-error)] hover:opacity-90",
      outline:
        "border border-[var(--color-outline-variant)] bg-transparent hover:bg-[var(--color-surface-container-high)] text-[var(--color-on-surface)]",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-[12px]",
      md: "px-4 py-2 text-[13px]",
      lg: "px-6 py-3 text-[14px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded font-semibold uppercase tracking-[0.06em] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-[1.02] active:scale-[0.98]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
