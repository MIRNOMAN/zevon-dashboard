import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Variant definitions
// ---------------------------------------------------------------------------

const baseStyles =
  "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

const variantStyles = {
  primary:
    "bg-foreground text-background shadow hover:bg-foreground/90 focus-visible:ring-foreground",
  secondary:
    "bg-foreground/10 text-foreground shadow-sm hover:bg-foreground/20 focus-visible:ring-foreground/50",
  outline:
    "border border-foreground/20 bg-transparent text-foreground shadow-sm hover:bg-foreground/5 focus-visible:ring-foreground/50",
  ghost:
    "text-foreground hover:bg-foreground/5 focus-visible:ring-foreground/50",
  destructive:
    "bg-red-600 text-white shadow hover:bg-red-700 focus-visible:ring-red-600",
} as const;

const sizeStyles = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
} as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
