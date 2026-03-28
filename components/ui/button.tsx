import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:  'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
        outline:  'border border-surface-border text-white hover:bg-surface-muted',
        ghost:    'text-gray-400 hover:text-white hover:bg-surface-muted',
        danger:   'bg-red-600 text-white hover:bg-red-700',
      },
      size: {
        sm:   'h-8  px-3 text-xs',
        md:   'h-10 px-4',
        lg:   'h-12 px-6 text-base',
        icon: 'h-9  w-9',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size:    'md',
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
