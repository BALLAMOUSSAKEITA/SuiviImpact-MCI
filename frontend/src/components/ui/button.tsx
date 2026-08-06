import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bioluminescent-teal/40 focus-visible:ring-offset-2 focus-visible:ring-offset-midnight-navy disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-bioluminescent-teal text-deep-teal shadow-[var(--shadow-cta)] hover:brightness-105",
        outline:
          "border border-silver-mist/40 bg-transparent text-canvas-white hover:border-bioluminescent-teal/50 hover:bg-veil",
        ghost:
          "text-warm-sand hover:bg-veil hover:text-canvas-white",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        lg: "h-11 px-8",
        sm: "h-8 px-4 text-xs font-medium",
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
