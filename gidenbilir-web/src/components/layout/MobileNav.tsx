'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, MessageSquare, Play, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages'

interface NavItem {
  href: string
  label: string
  icon: typeof Home
  highlight?: boolean
}

const SIDE_ITEMS: NavItem[] = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/discover', label: 'Keşfet', icon: Compass },
  { href: '/videos', label: 'Videolar', icon: Play },
  { href: '/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/profile/me', label: 'Profil', icon: User },
]

/**
 * Mobil ve tablet için alt navigasyon (lg breakpoint altında).
 * Mobil app'in TabBar'ına benzer ama web ergonomisine uyarlanmış.
 */
export function MobileNav() {
  const pathname = usePathname()
  const unreadCount = useUnreadMessageCount()

  return (
    <nav
      aria-label="Mobil ana navigasyon"
      className="fixed inset-x-0 bottom-0 z-sticky lg:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Paylaş butonu — yukarıda yüzer */}
      <div className="absolute left-1/2 -translate-x-1/2 -top-6">
        <Link
          href="/share"
          aria-label="Paylaş"
          className="flex size-14 items-center justify-center rounded-full text-white shadow-lg"
          style={{ backgroundImage: 'var(--gradient-primary)' }}
        >
          <PlusCircle size={26} strokeWidth={2.2} />
        </Link>
      </div>

      {/* Ana nav bar */}
      <div className="border-t border-border bg-bg-surface">
        <ul className="grid grid-cols-5">
          {SIDE_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'))
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex flex-col items-center justify-center py-[10px] transition-colors',
                    active ? 'text-primary' : 'text-text-sub hover:text-text',
                  )}
                >
                  <span className="relative">
                    <Icon aria-hidden="true" size={22} strokeWidth={active ? 2.2 : 1.8} />
                    {href === '/messages' && unreadCount > 0 && (
                      <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[9px] font-bold text-white">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    </nav>
  )
}
