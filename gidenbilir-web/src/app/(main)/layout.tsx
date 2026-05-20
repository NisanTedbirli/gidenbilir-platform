/**
 * Main route group layout — auth guard + sidebar + nav.
 */
import type { ReactNode } from 'react'
import { ProtectedLayout } from '@/components/layout/ProtectedLayout'

export default function MainLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
