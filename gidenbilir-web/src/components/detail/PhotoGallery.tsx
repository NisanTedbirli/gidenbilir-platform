'use client'

import { useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MapPin, X } from 'lucide-react'

interface PhotoGalleryProps {
  photoUrls?: string[]
  title: string
  countryFlag?: string
  countryName?: string
  city?: string | null
}

export function PhotoGallery({
  photoUrls = [],
  title,
  countryFlag,
  countryName,
  city,
}: PhotoGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isOpen, setIsOpen] = useState(false)

  if (!photoUrls?.length) {
    return (
      <div
        className="relative aspect-video rounded-2xl overflow-hidden shadow-sm border border-white/60"
        style={{
          background:
            'linear-gradient(135deg, #fef6f0 0%, #fde8e4 30%, #f5dde4 65%, #e8d5e8 100%)',
        }}
        aria-label="Bu paylaşımda fotoğraf yok"
      >
        {/* Dekoratif daireler */}
        <div
          className="absolute -right-20 -top-20 h-72 w-72 rounded-full opacity-40"
          style={{ background: 'rgba(255,255,255,0.7)' }}
          aria-hidden="true"
        />
        <div
          className="absolute -bottom-24 -left-16 h-64 w-64 rounded-full opacity-30"
          style={{ background: 'rgba(255,255,255,0.6)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 left-1/4 h-24 w-24 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.7)' }}
          aria-hidden="true"
        />

        {/* Yıldız dekorasyonları — soft toprak/lavanta */}
        <span className="absolute right-10 top-8 opacity-50 text-2xl" style={{ color: '#c9a4c4' }} aria-hidden="true">✦</span>
        <span className="absolute left-12 top-16 opacity-40 text-lg" style={{ color: '#d9a8a0' }} aria-hidden="true">✦</span>
        <span className="absolute right-20 bottom-12 opacity-35 text-sm" style={{ color: '#c9a4c4' }} aria-hidden="true">✦</span>
        <span className="absolute left-20 bottom-8 opacity-45 text-base" style={{ color: '#d9a8a0' }} aria-hidden="true">✦</span>
        <span className="absolute right-1/3 top-1/4 opacity-30 text-xs" style={{ color: '#c9a4c4' }} aria-hidden="true">✦</span>

        {/* Ana içerik */}
        <div className="relative z-10 h-full w-full flex flex-col items-center justify-center gap-md p-xl">
          <div
            className="flex items-center justify-center rounded-full bg-white/70 backdrop-blur-md shadow-md size-32 ring-4 ring-white/80"
            aria-hidden="true"
          >
            <span className="text-7xl">
              {countryFlag || '🌍'}
            </span>
          </div>
          {countryName && (
            <div
              className="flex items-center gap-2"
              style={{ color: '#6b5b7a' }}
            >
              <MapPin size={18} aria-hidden="true" />
              <span className="text-lg font-bold tracking-wide">
                {city ? `${city}, ${countryName}` : countryName}
              </span>
            </div>
          )}
          <p
            className="text-sm font-medium"
            style={{ color: '#8a7a93' }}
          >
            Fotoğrafsız bir hikâye, anlatılmaya değer ✨
          </p>
        </div>
      </div>
    )
  }

  const currentUrl = photoUrls[selectedIndex]
  const hasMultiple = photoUrls.length > 1

  const goToPrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? photoUrls.length - 1 : prev - 1))
  }

  const goToNext = () => {
    setSelectedIndex((prev) => (prev === photoUrls.length - 1 ? 0 : prev + 1))
  }

  return (
    <>
      {/* Main Gallery */}
      <div className="space-y-lg">
        {/* Current Photo */}
        <div
          className="relative aspect-video overflow-hidden rounded-2xl cursor-pointer group"
          onClick={() => setIsOpen(true)}
        >
          {currentUrl && (
            <Image
              src={currentUrl}
              alt={`${title} - Fotoğraf ${selectedIndex + 1}`}
              fill
              className="object-cover group-hover:scale-105 transition"
              sizes="(max-width: 1024px) 100vw, 60vw"
              priority={selectedIndex === 0}
            />
          )}

          {/* Navigation Buttons */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToPrevious()
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-bg/80 backdrop-blur-sm p-2 text-text hover:bg-bg transition opacity-0 group-hover:opacity-100"
                aria-label="Önceki fotoğraf"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goToNext()
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-bg/80 backdrop-blur-sm p-2 text-text hover:bg-bg transition opacity-0 group-hover:opacity-100"
                aria-label="Sonraki fotoğraf"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Dot Indicator */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {photoUrls.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedIndex(idx)
                  }}
                  className={`h-2 rounded-full transition ${
                    idx === selectedIndex
                      ? 'bg-primary w-6'
                      : 'bg-bg/60 w-2 hover:bg-bg/80'
                  }`}
                  aria-label={`Fotoğraf ${idx + 1}`}
                  aria-current={idx === selectedIndex}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnail Strip */}
        {hasMultiple && (
          <div className="flex gap-md overflow-x-auto pb-2">
            {photoUrls.map((url, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedIndex(idx)}
                className={`relative h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition ${
                  idx === selectedIndex
                    ? 'border-primary'
                    : 'border-border hover:border-border-medium'
                }`}
                aria-current={idx === selectedIndex}
                aria-label={`Fotoğraf ${idx + 1}`}
              >
                <Image
                  src={url}
                  alt={`${title} küçük resim ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 z-modal bg-bg/95 backdrop-blur-sm flex flex-col items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 rounded-full bg-bg-surface/80 backdrop-blur-sm p-2 text-text hover:bg-bg-surface transition"
            aria-label="Kapat"
          >
            <X size={24} />
          </button>

          {/* Full Screen Photo */}
          <div
            className="relative w-full h-full max-w-4xl max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {currentUrl && (
              <Image
                src={currentUrl}
                alt={`${title} - Tam ekran`}
                fill
                className="object-contain"
                sizes="100vw"
              />
            )}

            {/* Navigation */}
            {hasMultiple && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToPrevious()
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-bg-surface/80 backdrop-blur-sm p-3 text-text hover:bg-bg-surface transition"
                  aria-label="Önceki fotoğraf"
                >
                  <ChevronLeft size={28} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    goToNext()
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-bg-surface/80 backdrop-blur-sm p-3 text-text hover:bg-bg-surface transition"
                  aria-label="Sonraki fotoğraf"
                >
                  <ChevronRight size={28} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}
