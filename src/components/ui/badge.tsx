import * as React from 'react'
import { Slot } from '@/components/ui/slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden',
  {
    variants: {
      variant: {
        default:
          'border-[#00C8FF]/50 bg-gradient-to-r from-[#00C8FF] to-[#0099CC] text-white [a&]:hover:from-[#00D4FF] [a&]:hover:to-[#00AAE0] shadow-sm shadow-[#00C8FF]/30 font-semibold',
        secondary:
          'border-slate-300 dark:border-white/20 bg-slate-200 dark:bg-white/10 backdrop-blur-sm text-foreground dark:text-white [a&]:hover:bg-slate-300 dark:[a&]:hover:bg-white/20',
        destructive:
          'border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60',
        outline:
          'border-[#00C8FF]/40 text-[#00C8FF] [a&]:hover:bg-[#00C8FF]/10',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({
  className,
  variant,
  asChild = false,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : 'span'

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
