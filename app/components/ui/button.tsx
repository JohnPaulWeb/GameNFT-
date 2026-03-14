import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/app/lib/utils"


// ito yung ButtonVariants
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold font-display ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-cyan-500 to-cyan-400 text-black hover:shadow-glow hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 active:shadow-none",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:scale-105 active:scale-95",
        outline:
          "border-2 border-cyan-400/50 bg-transparent text-cyan-100 hover:bg-cyan-400/10 hover:border-cyan-400 hover:shadow-glow active:bg-cyan-400/20",
        secondary:
          "bg-white/10 border border-white/20 text-white hover:bg-white/20 hover:border-white/30 active:bg-white/30",
        ghost: "text-white hover:bg-white/10 hover:text-cyan-300 active:bg-white/5",
        link: "text-cyan-300 underline-offset-4 hover:underline hover:text-cyan-200",
      },
      size: {
        default: "h-11 px-6 py-2 text-base",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-lg px-8 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)


// ito yung interface ButtonProps
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}


// ito yung Button Component
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)

// ito yung  Button displayName
Button.displayName = "Button"

export { Button, buttonVariants }
