import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-mono font-bold transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        solid: "bg-green text-bg hover:opacity-90",
        outline: "border border-green text-green hover:bg-green/10",
        ghost: "text-dim hover:text-text",
      },
      size: {
        default: "px-4 py-2.5 text-sm",
        sm: "px-3 py-1.5 text-xs",
      },
    },
    defaultVariants: { variant: "solid", size: "default" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
