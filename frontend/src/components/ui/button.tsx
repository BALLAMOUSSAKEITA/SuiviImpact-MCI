import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[var(--radius-pill)] text-sm font-semibold transition-all duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-ink/20 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default:
          "bg-forest-ink text-white shadow-sm hover:bg-vine hover:shadow-md",
        outline:
          "border border-mist bg-white text-graphite hover:bg-veil hover:border-ash hover:shadow-sm",
        ghost: "text-slate hover:bg-veil hover:text-graphite",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 hover:shadow-md",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        lg: "h-12 px-8 text-base",
        sm: "h-8 px-4 text-xs",
        icon: "h-9 w-9 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button, buttonVariants };
