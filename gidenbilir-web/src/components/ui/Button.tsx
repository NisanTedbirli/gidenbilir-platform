/**
 * Button — mobile/components/Button.tsx port (web HTML).
 * Variants: primary (gradient), secondary (gradient mavi), outline, ghost, danger.
 */
'use client'

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  primary:
    'text-white font-extrabold shadow-md hover:brightness-110 active:brightness-95 focus-visible:outline-primary',
  secondary:
    'text-white font-extrabold shadow-md hover:brightness-110 active:brightness-95 focus-visible:outline-secondary',
  outline:
    'border-[1.5px] border-primary bg-transparent text-primary font-bold hover:bg-primary-light',
  ghost: 'bg-primary-light text-primary font-bold hover:brightness-95',
  danger: 'bg-danger text-white font-bold hover:brightness-110',
}

const sizeClasses: Record<Size, string> = {
  sm: 'h-9 px-md text-[13px]',
  md: 'h-11 px-lg text-[14px]',
  lg: 'h-12 px-lg text-[15px]',
}

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = 'primary',
    size = 'lg',
    isLoading,
    leftIcon,
    rightIcon,
    fullWidth,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || isLoading
  const gradient = variant === 'primary' || variant === 'secondary'

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        'relative inline-flex items-center justify-center gap-sm rounded-2xl tracking-wide transition-all',
        sizeClasses[size],
        variantClasses[variant],
        gradient && variant === 'primary' && 'bg-[image:var(--gradient-primary)]',
        gradient && variant === 'secondary' && 'bg-[image:var(--gradient-sky)]',
        fullWidth && 'w-full',
        isDisabled && 'pointer-events-none opacity-55',
        className,
      )}
      {...rest}
    >
      {isLoading ? (
        <span
          aria-hidden="true"
          className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      ) : (
        leftIcon
      )}
      <span>{children}</span>
      {!isLoading && rightIcon}
    </button>
  )
})
