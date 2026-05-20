/**
 * Input — mobile/components/Input.tsx port.
 * Uppercase label, kalın border, focus animasyonu, error state.
 * Erişilebilirlik: label ↔ input id linki, aria-invalid, aria-describedby.
 */
'use client'

import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label: string
  error?: string
  hint?: string
  rightSlot?: ReactNode
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { label, error, hint, rightSlot, id, className, ...props },
  ref,
) {
  const reactId = useId()
  const inputId = id ?? reactId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  return (
    <div className="mb-md">
      <label
        htmlFor={inputId}
        className={cn(
          'mb-xs block text-[12px] font-bold uppercase tracking-wider',
          error ? 'text-danger' : 'text-text-sub',
        )}
      >
        {label}
      </label>
      <div
        className={cn(
          'flex items-center overflow-hidden rounded-2xl border-[1.5px] bg-bg-surface transition-colors',
          'focus-within:border-primary',
          error ? 'border-danger focus-within:border-danger' : 'border-border',
        )}
      >
        <input
          id={inputId}
          ref={ref}
          aria-invalid={error ? true : undefined}
          aria-describedby={
            error ? errorId : hint ? hintId : undefined
          }
          className={cn(
            'flex-1 bg-transparent px-lg py-[14px] text-[15px] text-text outline-none placeholder:text-text-mute',
            className,
          )}
          {...props}
        />
        {rightSlot && <div className="pr-md">{rightSlot}</div>}
      </div>
      {error && (
        <p id={errorId} role="alert" className="mt-xs text-[11px] font-bold text-danger">
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={hintId} className="mt-xs text-[12px] text-text-sub">
          {hint}
        </p>
      )}
    </div>
  )
})
