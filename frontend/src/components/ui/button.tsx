import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-[8px] text-[15px] font-semibold transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-ink/25 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-forest-ink text-white hover:bg-vine",
        outline:
          "border border-hairline bg-white text-graphite hover:bg-pebble",
        ghost: "text-slate hover:bg-pebble hover:text-graphite",
        destructive:
          "bg-red-500 text-white hover:bg-red-600",
      },
      size: {
        default: "h-10 px-4",
        lg: "h-12 px-6 text-base",
        sm: "h-8 px-3 text-xs font-medium",
        icon: "h-10 w-10 rounded-[8px]",
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
