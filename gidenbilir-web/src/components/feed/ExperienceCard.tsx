'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { timeAgo } from '@/lib/dateUtils'
import type { Experience } from '@/types'

interface ExperienceCardProps {
  experience: Experience
  priority?: boolean
}

export function ExperienceCard({ experience, priority = false }: ExperienceCardProps) {
  const coverPhoto = experience.photoUrls?.[0]
  const extraPhotos = (experience.photoUrls?.length ?? 0) - 1
  const ratingStars = Math.round(experience.rating || 0)

  return (
    <Link href={`/experiences/${experience.id}`}>
      <article className="group overflow-hidden rounded-2xl border border-border bg-bg-surface shadow-md transition hover:shadow-lg hover:brightness-95">
        {/* Cover Photo */}
        <div className="relative aspect-video overflow-hidden bg-bg-elevated">
          {coverPhoto ? (
            <Image
              src={coverPhoto}
              alt={experience.title}
              fill
              className="object-cover transition group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
            />
          ) : (
            <div
              className="relative h-full w-full overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, #fef6f0 0%, #fde8e4 35%, #f5dde4 70%, #e8d5e8 100%)',
              }}
              aria-label="Bu paylaşımda fotoğraf yok"
            >
              {/* Dekoratif daireler */}
              <div
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20"
                style={{ background: 'rgba(255,255,255,0.6)' }}
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-12 -left-8 h-32 w-32 rounded-full opacity-15"
                style={{ background: 'rgba(255,255,255,0.5)' }}
                aria-hidden="true"
              />

              {/* Yıldız dekorasyonları */}
              <span
                className="absolute right-6 top-4 opacity-40 text-sm"
                style={{ color: '#c9a4c4' }}
                aria-hidden="true"
              >
                ✦
              </span>
              <span
                className="absolute left-8 bottom-5 opacity-35 text-xs"
                style={{ color: '#d9a8a0' }}
                aria-hidden="true"
              >
                ✦
              </span>
              <span
                className="absolute right-12 bottom-8 opacity-30 text-[10px]"
                style={{ color: '#c9a4c4' }}
                aria-hidden="true"
              >
                ✦
              </span>

              {/* Ana içerik */}
              <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-1.5 p-md">
                <div
                  className="flex items-center justify-center rounded-full bg-white/60 backdrop-blur-sm shadow-sm size-16 ring-2 ring-white/70"
                  aria-hidden="true"
                >
                  <span className="text-4xl">
                    {experience.countryFlag || '🌍'}
                  </span>
                </div>
                <div
                  className="flex items-center gap-1"
                  style={{ color: '#6b5b7a' }}
                >
                  <MapPin size={12} aria-hidden="true" />
                  <span className="text-[12px] font-bold tracking-wide line-clamp-1">
                    {experience.countryName}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Category Badge */}
          <div className="absolute left-3 top-3 rounded-full bg-primary px-3 py-1.5 text-[12px] font-bold text-text-on shadow-md">
            <span className="mr-1" aria-hidden="true">
              {experience.categoryIcon}
            </span>
            {experience.categoryName}
          </div>

          {/* Extra photos counter */}
          {extraPhotos > 0 && (
            <div
              className="absolute right-3 bottom-3 rounded-full bg-black/70 px-3 py-1 text-[13px] font-bold text-white shadow-md backdrop-blur-sm"
              aria-label={`${extraPhotos} fotoğraf daha var`}
            >
              +{extraPhotos}
            </div>
          )}
        </div>

        {/* Card Body */}
        <div className="p-lg">
          {/* Title */}
          <h3 className="mb-sm line-clamp-2 text-[15px] font-bold text-text">
            {experience.title}
          </h3>

          {/* Author */}
          <div className="mb-md flex items-center gap-2 text-[13px] text-text-sub">
            <span aria-hidden="true">{experience.authorNationalityFlag}</span>
            <span className="line-clamp-1">{experience.authorName}</span>
          </div>

          {/* Location */}
          <div className="mb-md flex items-center gap-1.5 text-[13px] text-text-sub">
            <span aria-hidden="true">{experience.countryFlag}</span>
            <span className="line-clamp-1">
              {experience.city && `${experience.city}, `}
              {experience.countryName}
            </span>
          </div>

          {/* Rating Stars */}
          {(experience.rating || 0) > 0 && (
            <div className="mb-md flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= ratingStars ? 'text-accent' : 'text-text-mute'}
                  aria-hidden="true"
                >
                  ★
                </span>
              ))}
            </div>
          )}

          {/* Stats Row */}
          <div className="flex items-center justify-between border-t border-border pt-md text-[12px] text-text-sub">
            <span>
              ❤️ <span className="font-semibold text-text">{experience.likeCount}</span>
            </span>
            <time dateTime={experience.createdAt} className="text-text-mute">
              {timeAgo(experience.createdAt)}
            </time>
          </div>
        </div>
      </article>
    </Link>
  )
}
