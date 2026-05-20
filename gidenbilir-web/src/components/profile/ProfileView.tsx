'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Settings, User as UserIcon } from 'lucide-react'
import { getUserStats, getUserExperiences } from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { cn } from '@/lib/cn'
import { ProfileHeader } from './ProfileHeader'
import { UserExperiencesGrid } from './UserExperiencesGrid'
import { AccountSettings } from './AccountSettings'

interface ProfileViewProps {
  userId: number
}

type Tab = 'experiences' | 'settings'

export function ProfileView({ userId }: ProfileViewProps) {
  const currentUser = useAuthStore((s) => s.user)
  const isOwner = currentUser?.userId === userId
  const [tab, setTab] = useState<Tab>('experiences')

  const {
    data: stats,
    isLoading: statsLoading,
    error: statsError,
  } = useQuery({
    queryKey: ['user-stats', userId],
    queryFn: async () => {
      const res = await getUserStats(userId)
      return res.data
    },
  })

  const {
    data: experiences = [],
    isLoading: expLoading,
    refetch: refetchExperiences,
  } = useQuery({
    queryKey: ['user-experiences', userId],
    queryFn: async () => {
      const res = await getUserExperiences(userId)
      return res.data
    },
  })

  if (statsError) {
    return (
      <div className="container-content py-xl">
        <p className="text-danger">Kullanıcı bilgisi yüklenemedi.</p>
      </div>
    )
  }

  if (statsLoading || !stats) {
    return (
      <div className="container-content py-xl">
        <p className="text-text-sub">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="container-content py-xl">
      <ProfileHeader stats={stats} isOwner={isOwner} />

      {isOwner && (
        <div className="mt-2xl mb-xl flex gap-2 border-b border-border">
          <button
            type="button"
            onClick={() => setTab('experiences')}
            className={cn(
              'flex items-center gap-2 px-md py-md text-[14px] font-bold transition-colors border-b-2 -mb-px',
              tab === 'experiences'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text',
            )}
          >
            <UserIcon size={16} />
            Paylaşımlarım ({stats.experienceCount})
          </button>
          <button
            type="button"
            onClick={() => setTab('settings')}
            className={cn(
              'flex items-center gap-2 px-md py-md text-[14px] font-bold transition-colors border-b-2 -mb-px',
              tab === 'settings'
                ? 'border-primary text-primary'
                : 'border-transparent text-text-sub hover:text-text',
            )}
          >
            <Settings size={16} />
            Hesap Ayarları
          </button>
        </div>
      )}

      {(!isOwner || tab === 'experiences') && (
        <div className="mt-xl">
          {!isOwner && (
            <h2 className="mb-lg text-[20px] font-bold">Paylaşımlar</h2>
          )}
          <UserExperiencesGrid
            experiences={experiences}
            isLoading={expLoading}
            isOwner={isOwner}
            onChange={() => refetchExperiences()}
          />
        </div>
      )}

      {isOwner && tab === 'settings' && (
        <div className="mt-xl">
          <AccountSettings />
        </div>
      )}
    </div>
  )
}
