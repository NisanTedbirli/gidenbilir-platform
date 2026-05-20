/**
 * Form hatası gösterme komponenti.
 * role="alert" ile ekran okuyucu hemen duyurur (WCAG 4.1.3).
 */
import { cn } from '@/lib/cn'

interface Props {
  message?: string | null
  className?: string
}

export function ErrorBox({ message, className }: Props) {
  if (!message) return null
  return (
    <div
      role="alert"
      className={cn(
        'flex items-start gap-sm rounded-xl bg-danger-light px-lg py-md text-[14px] text-danger',
        className,
      )}
    >
      <span aria-hidden="true" className="mt-[2px] shrink-0">
        ⚠️
      </span>
      <p className="font-medium">{message}</p>
    </div>
  )
}
