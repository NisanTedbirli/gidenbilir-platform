'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Home, LogOut, MessageSquare, PlusCircle, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { useUnreadMessageCount } from '@/hooks/useUnreadMessages'

interface NavItem {
  href: string
  label: string
  icon: typeof Home
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Ana Sayfa', icon: Home },
  { href: '/discover', label: 'Keşfet', icon: Compass },
  { href: '/share', label: 'Paylaş', icon: PlusCircle },
  { href: '/messages', label: 'Mesajlar', icon: MessageSquare },
  { href: '/profile/me', label: 'Profilim', icon: User },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, logout, logoutPending } = useAuth()
  const unreadCount = useUnreadMessageCount()

  return (
    <aside
      className="fixed inset-y-0 left-0 z-sticky hidden w-[var(--layout-sidebar-width)] flex-col border-r border-border bg-bg-surface lg:flex"
      aria-label="Ana navigasyon"
    >
      {/* Logo */}
      <div className="flex h-[var(--layout-header-height)] items-center border-b border-border px-lg">
        <Link
          href="/"
          className="text-[22px] font-extrabold tracking-tight"
          style={{
            backgroundImage: 'var(--gradient-primary)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
          }}
        >
          GidenBilir
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-md" aria-label="Sayfa bağlantıları">
        <ul className="space-y-xs">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active =
              href === '/' ? pathname === '/' : pathname.startsWith(href.split('/').slice(0, 2).join('/'))
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'flex items-center gap-md rounded-xl px-md py-[10px] text-[15px] font-medium transition-colors',
                    active
                      ? 'bg-primary-light text-primary'
                      : 'text-text-sub hover:bg-bg-elevated hover:text-text',
                  )}
                >
                  <Icon
                    aria-hidden="true"
                    size={20}
                    strokeWidth={active ? 2.2 : 1.8}
                  />
                  <span className="flex-1">{label}</span>
                  {href === '/messages' && unreadCount > 0 && (
                    <span
                      aria-label={`${unreadCount} okunmamış mesaj`}
                      className="inline-flex min-w-[20px] items-center justify-center rounded-full bg-danger px-1.5 py-0.5 text-[11px] font-bold text-white"
                    >
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User panel */}
      {user && (
        <div className="border-t border-border p-md">
          <div className="mb-sm flex items-center gap-md px-md">
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-primary-light text-xl"
            >
              {user.nationalityFlag}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-bold text-text">{user.fullName}</p>
              <p className="truncate text-[12px] text-text-sub">{user.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => logout()}
            disabled={logoutPending}
            className="flex w-full items-center gap-sm rounded-xl px-md py-[10px] text-[13px] font-bold text-text-sub transition-colors hover:bg-danger-light hover:text-danger disabled:opacity-50"
          >
            <LogOut aria-hidden="true" size={16} />
            <span>{logoutPending ? 'Çıkış yapılıyor...' : 'Çıkış Yap'}</span>
          </button>
        </div>
      )}
    </aside>
  )
}
