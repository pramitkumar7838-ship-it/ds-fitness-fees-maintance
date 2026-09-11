"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark active:bg-brand-dark",
  secondary: "bg-steel text-white hover:bg-steel-light active:bg-steel-light",
  ghost: "bg-transparent text-ink border border-border hover:bg-bg",
  danger: "bg-overdue text-white hover:brightness-95",
};

const sizeClasses: Record<Size, string> = {
  sm: "text-sm px-3 py-1.5 rounded-lg",
  md: "text-sm px-4 py-2.5 rounded-lg",
  lg: "text-base px-5 py-3.5 rounded-xl",
};

const Button = forwardRef<HTMLButtonElement, Props>(
  ({ variant = "primary", size = "md", fullWidth, className = "", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={[
          "font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2",
          variantClasses[variant],
          sizeClasses[size],
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
export default Button;
