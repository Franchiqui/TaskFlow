'use client';

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const inputVariants = cva(
  "flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        destructive: "border-destructive focus-visible:ring-destructive",
        success: "border-success focus-visible:ring-success",
      },
      size: {
        default: "h-10",
        sm: "h-8 px-2 text-xs",
        lg: "h-12 px-4 text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  success?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      variant,
      size,
      leftIcon,
      rightIcon,
      error,
      success,
      ...props
    },
    ref
  ) => {
    const status = error ? "destructive" : success ? "success" : variant

    return (
      <div className="w-full space-y-1">
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            type={type}
            className={cn(
              inputVariants({ variant: status, size }),
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${props.id}-error`}
            className="text-xs text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p className="text-xs text-success" role="status">
            {success}
          </p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input, inputVariants }