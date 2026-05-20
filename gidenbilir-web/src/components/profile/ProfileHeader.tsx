'use client'

import { Calendar, Heart, MapPin, Star } from 'lucide-react'
import type { UserStats } from '@/types'

interface ProfileHeaderProps {
  stats: UserStats
  isOwner: boolean
}

export function ProfileHeader({ stats, isOwner }: ProfileHeaderProps) {
  const joinDate = new Date(stats.createdAt).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div
      className="rounded-2xl p-xl shadow-sm border border-border"
      style={{
        background:
          'linear-gradient(135deg, var(--color-primary-light) 0%, var(--color-bg-elevated) 100%)',
      }}
    >
      <div className="flex items-center gap-lg flex-wrap">
        {/* Avatar */}
        <div className="flex size-20 items-center justify-center rounded-full bg-white shadow-md ring-4 ring-white">
          <span className="text-4xl" aria-hidden="true">
            {stats.nationalityFlag}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-[28px] font-extrabold tracking-tight text-text mb-1">
            {stats.fullName}
          </h1>
          {isOwner && (
            <p className="text-[14px] text-text-sub mb-1">{stats.email}</p>
          )}
          <div className="flex items-center gap-2 text-[13px] text-text-sub">
            <Calendar size={14} aria-hidden="true" />
            <span>{joinDate} tarihinden beri üye</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-md mt-xl">
        <StatCard
          icon={<MapPin size={18} />}
          value={stats.experienceCount}
          label="Paylaşım"
        />
        <StatCard
          icon={<Heart size={18} />}
          value={stats.totalLikes}
          label="Beğeni"
        />
        <StatCard
          icon={<Star size={18} />}
          value={stats.averageRating > 0 ? stats.averageRating.toFixed(1) : '—'}
          label="Ortalama"
        />
      </div>
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode
  value: number | string
  label: string
}) {
  return (
    <div className="rounded-xl bg-white/70 backdrop-blur-sm p-md text-center shadow-sm">
      <div className="flex items-center justify-center text-primary mb-1">
        {icon}
      </div>
      <div className="text-[22px] font-extrabold text-text">{value}</div>
      <div className="text-[11px] uppercase tracking-wider text-text-sub font-bold">
        {label}
      </div>
    </div>
  )
}
