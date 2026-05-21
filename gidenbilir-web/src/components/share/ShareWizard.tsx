'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createExperience, uploadExperiencePhoto, uploadExperienceVideo } from '@/lib/api'
import { Step1Location } from './Step1Location'
import { Step2Story } from './Step2Story'
import { Step3Photos } from './Step3Photos'
import { Button } from '@/components/ui'
import type { BudgetLevel } from '@/types'
import { ChevronLeft } from 'lucide-react'

interface PhotoPreview {
  id: string
  file: File
  preview: string
}

export function ShareWizard() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const submitLockRef = useRef(false)

  // Step 1: Location
  const [countryId, setCountryId] = useState<number | null>(null)
  const [city, setCity] = useState('')

  // Step 2: Story
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [rating, setRating] = useState(0)
  const [budgetLevel, setBudgetLevel] = useState<BudgetLevel | null>(null)
  const [visitDate, setVisitDate] = useState('')

  // Step 3: Photos + Video
  const [photos, setPhotos] = useState<PhotoPreview[]>([])
  const [video, setVideo] = useState<{ file: File; preview: string } | null>(null)

  const createMutation = useMutation({
    mutationFn: async () => {
      // Validate required fields
      if (!countryId) throw new Error('Ülke seçmelisiniz.')
      if (!title.trim()) throw new Error('Başlık yazmalısınız.')
      if (!description.trim()) throw new Error('Açıklama yazmalısınız.')
      if (!categoryId) throw new Error('Kategori seçmelisiniz.')
      if (rating === 0) throw new Error('Puanlama yapmalısınız.')

      // Create experience
      const response = await createExperience({
        title: title.trim(),
        description: description.trim(),
        countryId,
        categoryId,
        city: city || undefined,
        rating,
        budgetLevel: budgetLevel || undefined,
        visitDate: visitDate || undefined,
      })

      const experienceId = response.data.id

      // Upload photos
      for (const photo of photos) {
        await uploadExperiencePhoto(experienceId, photo.file)
      }

      // Upload video
      if (video) {
        await uploadExperienceVideo(experienceId, video.file)
      }

      return experienceId
    },
    onSuccess: (experienceId) => {
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      router.push(`/experiences/${experienceId}`)
    },
    onError: (err) => {
      submitLockRef.current = false
      const axiosMsg = (err as {response?: {data?: {message?: string}}}).response?.data?.message
      setError(axiosMsg ?? (err instanceof Error ? err.message : 'Bir hata oluştu.'))
    },
  })

  const handleNext = () => {
    if (createMutation.isPending) return
    setError(null)

    // Validate step 1
    if (step === 1 && !countryId) {
      setError('Ülke seçmelisiniz.')
      return
    }

    // Validate step 2
    if (step === 2) {
      if (!title.trim()) {
        setError('Başlık yazmalısınız.')
        return
      }
      if (!description.trim()) {
        setError('Açıklama yazmalısınız.')
        return
      }
      if (description.trim().length < 10) {
        setError('Açıklama en az 10 karakter olmalıdır.')
        return
      }
      if (description.trim().length > 5000) {
        setError('Açıklama en fazla 5000 karakter olmalıdır.')
        return
      }
      if (!categoryId) {
        setError('Kategori seçmelisiniz.')
        return
      }
      if (rating === 0) {
        setError('Puanlama yapmalısınız.')
        return
      }
    }

    if (step < 3) {
      setStep(step + 1)
    } else {
      if (submitLockRef.current) return
      submitLockRef.current = true
      createMutation.mutate()
    }
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-bg-surface">
      <div className="container-content py-xl">
        {/* Header */}
        <div className="mb-2xl">
          <div className="flex items-center gap-md mb-lg">
            {step > 1 && (
              <button
                onClick={handleBack}
                disabled={createMutation.isPending}
                className="p-sm rounded-lg hover:bg-bg-elevated transition disabled:opacity-50"
                aria-label="Önceki adıma dön"
              >
                <ChevronLeft size={24} className="text-primary" />
              </button>
            )}
            <h1 className="text-[28px] font-extrabold tracking-tight">Deneyim Paylaş</h1>
          </div>

          {/* Progress Indicator */}
          <div className="flex gap-md">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition ${
                  s <= step ? 'bg-primary' : 'bg-border'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-text-mute mt-md">
            Adım {step} / 3
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-lg p-md rounded-lg bg-danger-light border border-danger text-danger text-sm">
            {error}
          </div>
        )}

        {/* Step Content */}
        <div className="max-w-2xl bg-bg-elevated rounded-lg p-lg border border-border mb-xl">
          {step === 1 && (
            <Step1Location
              countryId={countryId}
              city={city}
              onCountryChange={setCountryId}
              onCityChange={setCity}
            />
          )}

          {step === 2 && (
            <Step2Story
              title={title}
              description={description}
              categoryId={categoryId}
              rating={rating}
              budgetLevel={budgetLevel}
              visitDate={visitDate}
              onTitleChange={setTitle}
              onDescriptionChange={setDescription}
              onCategoryChange={setCategoryId}
              onRatingChange={setRating}
              onBudgetLevelChange={setBudgetLevel}
              onVisitDateChange={setVisitDate}
            />
          )}

          {step === 3 && (
            <Step3Photos
              photos={photos}
              onPhotosChange={setPhotos}
              video={video}
              onVideoChange={setVideo}
            />
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-md justify-between max-w-2xl">
          <Button
            onClick={handleBack}
            disabled={step === 1 || createMutation.isPending}
            variant="secondary"
          >
            Geri
          </Button>

          <Button
            onClick={handleNext}
            disabled={createMutation.isPending}
            isLoading={createMutation.isPending}
          >
            {step === 3 ? 'Paylaş' : 'İleri'}
          </Button>
        </div>
      </div>
    </div>
  )
}
