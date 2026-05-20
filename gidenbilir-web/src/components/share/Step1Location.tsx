'use client'

import { useState, useEffect, useCallback } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getCountries } from '@/lib/api'
import { CITIES } from '@/lib/cities'
import type { Country } from '@/types'
import { ChevronDown } from 'lucide-react'

interface Step1LocationProps {
  countryId: number | null
  city: string
  onCountryChange: (id: number | null) => void
  onCityChange: (city: string) => void
}

export function Step1Location({
  countryId,
  city,
  onCountryChange,
  onCityChange,
}: Step1LocationProps) {
  const [cities, setCities] = useState<string[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [showCountries, setShowCountries] = useState(false)

  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: async () => {
      const response = await getCountries()
      return response.data
    },
  })

  const filteredCountries = countries.filter(c =>
    c.name.toLowerCase().includes(searchInput.toLowerCase())
  )

  const memoizedOnCityChange = useCallback(onCityChange, [onCityChange])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('#step1-country-wrapper')) {
        setShowCountries(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Update cities when country changes
  useEffect(() => {
    if (!countryId) {
      setCities([])
      return
    }

    const country = countries.find((c: Country) => c.id === countryId)
    if (country) {
      const countryName = country.name
      const citiesList = CITIES[countryName] ?? []
      setCities(citiesList)
      memoizedOnCityChange('')
    }
  }, [countryId, countries, memoizedOnCityChange])

  return (
    <div className="space-y-lg">
      <h2 className="text-[22px] font-bold text-text">Nereye gittiniz?</h2>

      {/* Country Select */}
      <div id="step1-country-wrapper">
        <label htmlFor="step1-country" className="block text-sm font-semibold mb-sm text-text">
          Ülke *
        </label>
        <div className="relative">
          <input
            id="step1-country"
            type="text"
            placeholder="Ülke seçin..."
            value={searchInput || (countryId ? countries.find(c => c.id === countryId)?.name ?? '' : '')}
            onChange={(e) => {
              setSearchInput(e.target.value)
              setShowCountries(true)
            }}
            onFocus={() => setShowCountries(true)}
            className="w-full rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none"
          />
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />

          {showCountries && countries.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-sm bg-bg-elevated border border-border rounded-lg shadow-lg max-h-80 overflow-y-auto z-10">
              {filteredCountries.length > 0 ? (
                filteredCountries.map((country) => (
                  <button
                    key={country.id}
                    type="button"
                    onClick={() => {
                      onCountryChange(country.id)
                      setSearchInput('')
                      setShowCountries(false)
                    }}
                    className="w-full px-lg py-md text-left hover:bg-bg-surface transition text-text"
                  >
                    {country.flagEmoji} {country.name}
                  </button>
                ))
              ) : (
                <div className="px-lg py-md text-text-mute text-sm">Ülke bulunamadı</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* City Select */}
      {countryId && (
        <div>
          <label htmlFor="step1-city" className="block text-sm font-semibold mb-sm text-text">
            Şehir veya Bölge
          </label>
          <div className="relative">
            <select
              id="step1-city"
              value={city}
              onChange={(e) => onCityChange(e.target.value)}
              className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">Şehir seçin veya yazın...</option>
              {cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none" size={20} />
          </div>
        </div>
      )}
    </div>
  )
}
