import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-none text-[0.9375rem] font-semibold transition-colors duration-[var(--duration-fast)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0d4f38]/35 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-[#0d4f38] bg-[#0d4f38] text-white hover:bg-[#165c44] hover:border-[#165c44]",
        outline:
          "border border-[#0d4f38] bg-white text-[#0d4f38] hover:bg-[#e0f5ea]",
        ghost:
          "border border-transparent bg-transparent text-[#0d4f38] hover:bg-[#e0f5ea]",
        destructive:
          "border border-[#ce1126] bg-white text-[#ce1126] hover:bg-[#fdecea]",
      },
      size: {
        default: "h-10 px-5",
        lg: "h-11 px-6 text-base",
        sm: "h-8 px-3 text-[13px]",
        icon: "h-10 w-10",
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
