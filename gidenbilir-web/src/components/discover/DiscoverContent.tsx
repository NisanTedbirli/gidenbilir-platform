'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { getCountries, getCategories, getNationalities } from '@/lib/api'
import { FeedGrid } from '@/components/feed/FeedGrid'
import type { Country, Category, Nationality, ExperienceFilters } from '@/types'
import { ChevronDown } from 'lucide-react'

export function DiscoverContent() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Filter state
  const [selectedCountryId, setSelectedCountryId] = useState<number | null>(
    searchParams.get('countryId') ? Number(searchParams.get('countryId')) : null
  )
  const [selectedNationalityId, setSelectedNationalityId] = useState<number | null>(
    searchParams.get('nationalityId') ? Number(searchParams.get('nationalityId')) : null
  )
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    searchParams.get('categoryId') ? Number(searchParams.get('categoryId')) : null
  )
  const [minRating, setMinRating] = useState<number>(
    searchParams.get('minRating') ? Number(searchParams.get('minRating')) : 0
  )

  // Fetch countries, nationalities & categories
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await getCountries()
      return response.data
    },
  })

  const { data: nationalities = [] } = useQuery({
    queryKey: ['nationalities'],
    queryFn: async () => {
      const response = await getNationalities()
      return response.data
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await getCategories()
      return response.data
    },
  })

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (selectedCountryId) params.set('countryId', selectedCountryId.toString())
    if (selectedNationalityId) params.set('nationalityId', selectedNationalityId.toString())
    if (selectedCategoryId) params.set('categoryId', selectedCategoryId.toString())
    if (minRating > 0) params.set('minRating', minRating.toString())

    const newUrl = params.toString() ? `/discover?${params.toString()}` : '/discover'
    router.push(newUrl, { scroll: false })
  }, [selectedCountryId, selectedNationalityId, selectedCategoryId, minRating, router])

  const handleClearFilters = () => {
    setSelectedCountryId(null)
    setSelectedNationalityId(null)
    setSelectedCategoryId(null)
    setMinRating(0)
  }

  const hasActiveFilters = selectedCountryId !== null || selectedNationalityId !== null || selectedCategoryId !== null || minRating > 0

  const filters: ExperienceFilters = {
    countryId: selectedCountryId ?? undefined,
    nationalityId: selectedNationalityId ?? undefined,
    categoryId: selectedCategoryId ?? undefined,
    minRating: minRating > 0 ? minRating : undefined,
  }

  return (
    <div className="container-content py-xl">
      <div className="mb-2xl">
        <h1 className="text-[28px] font-extrabold tracking-tight mb-lg">Keşfet</h1>

        {/* Filters */}
        <div className="bg-bg-elevated rounded-lg p-lg border border-border space-y-lg">
          {/* Country Filter */}
          <div>
            <label htmlFor="country-select" className="block text-sm font-semibold mb-sm text-text">
              Ülke
            </label>
            <div className="relative">
              <select
                id="country-select"
                value={selectedCountryId ?? ''}
                onChange={(e) => setSelectedCountryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">Tümü</option>
                {countries.map((country: Country) => (
                  <option key={country.id} value={country.id}>
                    {country.flagEmoji} {country.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
            </div>
          </div>

          {/* Nationality Filter */}
          <div>
            <label htmlFor="nationality-select" className="block text-sm font-semibold mb-sm text-text">
              Kimin Gözünde
            </label>
            <div className="relative">
              <select
                id="nationality-select"
                value={selectedNationalityId ?? ''}
                onChange={(e) => setSelectedNationalityId(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">Tümü</option>
                {nationalities.map((nationality: Nationality) => (
                  <option key={nationality.id} value={nationality.id}>
                    {nationality.flagEmoji} {nationality.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label htmlFor="category-select" className="block text-sm font-semibold mb-sm text-text">
              Kategori
            </label>
            <div className="relative">
              <select
                id="category-select"
                value={selectedCategoryId ?? ''}
                onChange={(e) => setSelectedCategoryId(e.target.value ? Number(e.target.value) : null)}
                className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value="">Tümü</option>
                {categories.map((category: Category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <label htmlFor="rating-select" className="block text-sm font-semibold mb-sm text-text">
              Minimum Puan
            </label>
            <div className="relative">
              <select
                id="rating-select"
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
              >
                <option value={0}>Tümü</option>
                <option value={1}>★ 1+</option>
                <option value={2}>★★ 2+</option>
                <option value={3}>★★★ 3+</option>
                <option value={4}>★★★★ 4+</option>
                <option value={5}>★★★★★ 5</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full py-md px-lg rounded-lg bg-bg-surface text-text font-semibold hover:bg-bg-elevated transition border border-border"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Feed with filters */}
      <FeedGrid filters={filters} />
    </div>
  )
}
