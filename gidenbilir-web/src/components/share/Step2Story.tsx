'use client'

import { useQuery } from '@tanstack/react-query'
import { getCategories } from '@/lib/api'
import type { Category, BudgetLevel } from '@/types'
import { ChevronDown } from 'lucide-react'

interface Step2StoryProps {
  title: string
  description: string
  categoryId: number | null
  rating: number
  budgetLevel: BudgetLevel | null
  visitDate: string
  onTitleChange: (title: string) => void
  onDescriptionChange: (desc: string) => void
  onCategoryChange: (id: number | null) => void
  onRatingChange: (rating: number) => void
  onBudgetLevelChange: (level: BudgetLevel | null) => void
  onVisitDateChange: (date: string) => void
}

const BUDGET_LEVELS: BudgetLevel[] = ['Ucuz', 'Orta', 'Pahalı']

export function Step2Story({
  title,
  description,
  categoryId,
  rating,
  budgetLevel,
  visitDate,
  onTitleChange,
  onDescriptionChange,
  onCategoryChange,
  onRatingChange,
  onBudgetLevelChange,
  onVisitDateChange,
}: Step2StoryProps) {
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories()
      return response.data
    },
  })

  return (
    <div className="space-y-lg">
      <h2 className="text-[22px] font-bold text-text">Deneyimi Anlatın</h2>

      {/* Title */}
      <div>
        <label htmlFor="step2-title" className="block text-sm font-semibold mb-sm text-text">
          Başlık *
        </label>
        <input
          id="step2-title"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Deneyimin başlığı..."
          className="w-full rounded-lg border border-border bg-bg-surface px-lg py-md text-text placeholder:text-text-mute focus:border-primary focus:outline-none"
          maxLength={100}
        />
        <p className="text-[12px] text-text-mute mt-xs">{title.length}/100</p>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="step2-desc" className="block text-sm font-semibold mb-sm text-text">
          Açıklama * (10-5000 karakter)
        </label>
        <textarea
          id="step2-desc"
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          placeholder="Deneyiminizi detaylı anlatın..."
          className={`w-full rounded-lg border bg-bg-surface px-lg py-md text-text placeholder:text-text-mute focus:outline-none resize-none ${
            description.trim().length < 10 && description.length > 0
              ? 'border-danger focus:border-danger'
              : 'border-border focus:border-primary'
          }`}
          rows={5}
          maxLength={5000}
        />
        <div className="flex justify-between items-center mt-xs">
          <p className={`text-[12px] ${description.trim().length < 10 && description.length > 0 ? 'text-danger' : 'text-text-mute'}`}>
            {description.length}/5000
          </p>
          {description.trim().length < 10 && description.length > 0 && (
            <p className="text-[12px] text-danger">En az 10 karakter yazmalısınız</p>
          )}
        </div>
      </div>

      {/* Category */}
      <div>
        <label htmlFor="step2-category" className="block text-sm font-semibold mb-sm text-text">
          Kategori *
        </label>
        <div className="relative">
          <select
            id="step2-category"
            value={categoryId ?? ''}
            onChange={(e) => onCategoryChange(e.target.value ? Number(e.target.value) : null)}
            className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">Kategori seçin...</option>
            {categories.map((cat: Category) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
        </div>
      </div>

      {/* Rating */}
      <div>
        <label htmlFor="step2-rating" className="block text-sm font-semibold mb-sm text-text">
          Puanlama: {rating}/5
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => onRatingChange(star)}
              className="text-3xl transition hover:scale-110"
              style={{
                color: star <= rating ? 'var(--color-accent)' : 'var(--color-text-mute)',
              }}
              aria-label={`${star} yıldız`}
              aria-pressed={star <= rating}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Budget Level */}
      <div>
        <label htmlFor="step2-budget" className="block text-sm font-semibold mb-sm text-text">
          Bütçe Seviyesi
        </label>
        <div className="relative">
          <select
            id="step2-budget"
            value={budgetLevel ?? ''}
            onChange={(e) => onBudgetLevelChange((e.target.value as BudgetLevel) || null)}
            className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
          >
            <option value="">Seçiniz...</option>
            {BUDGET_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
        </div>
      </div>

      {/* Visit Date */}
      <div>
        <label htmlFor="step2-date" className="block text-sm font-semibold mb-sm text-text">
          Ziyaret Tarihi
        </label>
        <input
          id="step2-date"
          type="date"
          value={visitDate}
          max={new Date().toISOString().slice(0, 10)}
          onChange={(e) => {
            const selected = e.target.value
            const today = new Date().toISOString().slice(0, 10)
            if (selected && selected > today) {
              onVisitDateChange(today)
            } else {
              onVisitDateChange(selected)
            }
          }}
          className="w-full rounded-lg border border-border bg-bg-surface px-lg py-md text-text focus:border-primary focus:outline-none"
        />
        <p className="text-[12px] text-text-mute mt-xs">Gelecek tarih seçilemez.</p>
      </div>
    </div>
  )
}
