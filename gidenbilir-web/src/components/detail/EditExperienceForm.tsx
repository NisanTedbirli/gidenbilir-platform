'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ChevronDown, Upload, X } from 'lucide-react'
import {
  getCategories,
  getExperience,
  getExperiencePhotos,
  deleteExperiencePhoto,
  updateExperience,
  uploadExperiencePhoto,
} from '@/lib/api'
import { useAuthStore } from '@/stores/authStore'
import { Button, ErrorBox } from '@/components/ui'
import type { Category } from '@/types'

interface EditExperienceFormProps {
  experienceId: number
}

const MAX_PHOTOS = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024

export function EditExperienceForm({ experienceId }: EditExperienceFormProps) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const user = useAuthStore((s) => s.user)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [rating, setRating] = useState(5)
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)

  // Fetch experience
  const { data: experience, isLoading, error: fetchError } = useQuery({
    queryKey: ['experience', experienceId],
    queryFn: async () => {
      const res = await getExperience(experienceId)
      return res.data
    },
  })

  const { data: photos = [], refetch: refetchPhotos } = useQuery({
    queryKey: ['experience-photos', experienceId],
    queryFn: async () => {
      const res = await getExperiencePhotos(experienceId)
      return res.data
    },
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await getCategories()
      return res.data
    },
  })

  // Pre-fill form from fetched data
  useEffect(() => {
    if (experience && !loaded) {
      setTitle(experience.title)
      setDescription(experience.description)
      setRating(experience.rating || 5)
      // Find category id by name
      const cat = categories.find(
        (c: Category) => c.name === experience.categoryName,
      )
      if (cat) setCategoryId(cat.id)
      setLoaded(true)
    }
  }, [experience, categories, loaded])

  const mutation = useMutation({
    mutationFn: () =>
      updateExperience(experienceId, {
        title: title.trim(),
        description: description.trim(),
        rating,
        categoryId: categoryId!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] })
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
      router.replace(`/experiences/${experienceId}`)
    },
    onError: (err: unknown) => {
      const message =
        err && typeof err === 'object' && 'response' in err
          ? ((err as { response?: { data?: { message?: string } } }).response?.data?.message ?? null)
          : null
      setError(message ?? 'Paylaşım güncellenemedi.')
    },
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (!title.trim() || title.trim().length < 3) {
      setError('Başlık en az 3 karakter olmalı.')
      return
    }
    if (!description.trim() || description.trim().length < 10) {
      setError('Açıklama en az 10 karakter olmalı.')
      return
    }
    if (!categoryId) {
      setError('Kategori zorunlu.')
      return
    }
    mutation.mutate()
  }

  const handleAddPhotos = async (files: FileList | null) => {
    setPhotoError(null)
    if (!files || files.length === 0) return

    const remaining = MAX_PHOTOS - photos.length
    if (remaining <= 0) {
      setPhotoError(`En fazla ${MAX_PHOTOS} fotoğraf yükleyebilirsiniz.`)
      return
    }

    const list = Array.from(files).slice(0, remaining)
    setUploading(true)
    try {
      for (const file of list) {
        if (!file.type.startsWith('image/')) {
          setPhotoError('Sadece resim dosyaları yüklenebilir.')
          continue
        }
        if (file.size > MAX_FILE_SIZE) {
          setPhotoError("Dosya boyutu 10MB'dan az olmalıdır.")
          continue
        }
        await uploadExperiencePhoto(experienceId, file)
      }
      await refetchPhotos()
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] })
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
    } catch {
      setPhotoError('Fotoğraf yüklenemedi.')
    } finally {
      setUploading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleDeletePhoto = async (photoId: number) => {
    setPhotoError(null)
    try {
      await deleteExperiencePhoto(photoId)
      await refetchPhotos()
      queryClient.invalidateQueries({ queryKey: ['experience', experienceId] })
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
    } catch {
      setPhotoError('Fotoğraf silinemedi.')
    }
  }

  if (fetchError) {
    return <p className="text-danger">Paylaşım yüklenemedi.</p>
  }

  if (isLoading || !experience) {
    return <p className="text-text-sub">Yükleniyor...</p>
  }

  // Owner kontrolü
  if (user && experience.authorId !== user.userId) {
    return (
      <div>
        <p className="text-danger mb-md">Bu paylaşımı düzenleme yetkin yok.</p>
        <Link href={`/experiences/${experienceId}`} className="text-primary hover:underline">
          ← Paylaşıma dön
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <Link
        href={`/experiences/${experienceId}`}
        className="inline-flex items-center gap-1 text-text-sub hover:text-primary mb-lg text-sm font-bold"
      >
        <ArrowLeft size={16} />
        Paylaşıma Dön
      </Link>

      <h1 className="text-[28px] font-extrabold tracking-tight mb-lg">
        Paylaşımı Düzenle
      </h1>

      <form onSubmit={handleSubmit} className="space-y-lg" noValidate>
        {/* Title */}
        <div>
          <label htmlFor="edit-title" className="block text-sm font-bold mb-sm text-text">
            Başlık *
          </label>
          <input
            id="edit-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={200}
            className="w-full rounded-lg border border-border bg-bg-surface px-lg py-md text-text placeholder:text-text-mute focus:border-primary focus:outline-none"
          />
          <p className="text-[12px] text-text-mute mt-xs">{title.length}/200</p>
        </div>

        {/* Description */}
        <div>
          <label htmlFor="edit-desc" className="block text-sm font-bold mb-sm text-text">
            Açıklama * (10-5000 karakter)
          </label>
          <textarea
            id="edit-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            maxLength={5000}
            className="w-full rounded-lg border border-border bg-bg-surface px-lg py-md text-text placeholder:text-text-mute focus:border-primary focus:outline-none resize-none"
          />
          <p className="text-[12px] text-text-mute mt-xs">{description.length}/5000</p>
        </div>

        {/* Category */}
        <div>
          <label htmlFor="edit-category" className="block text-sm font-bold mb-sm text-text">
            Kategori *
          </label>
          <div className="relative">
            <select
              id="edit-category"
              value={categoryId ?? ''}
              onChange={(e) =>
                setCategoryId(e.target.value ? Number(e.target.value) : null)
              }
              className="w-full appearance-none rounded-lg border border-border bg-bg-surface px-lg py-md pr-lg text-text focus:border-primary focus:outline-none cursor-pointer"
            >
              <option value="">Kategori seçin...</option>
              {categories.map((cat: Category) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-mute pointer-events-none"
              size={20}
            />
          </div>
        </div>

        {/* Rating */}
        <div>
          <label className="block text-sm font-bold mb-sm text-text">
            Puanlama: {rating}/5
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl transition hover:scale-110"
                style={{
                  color:
                    star <= rating
                      ? 'var(--color-accent)'
                      : 'var(--color-text-mute)',
                }}
                aria-label={`${star} yıldız`}
              >
                ★
              </button>
            ))}
          </div>
        </div>

        {/* Photos */}
        <div>
          <label className="block text-sm font-bold mb-sm text-text">
            Fotoğraflar ({photos.length}/{MAX_PHOTOS})
          </label>

          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-md mb-md">
              {photos.map((p) => (
                <div key={p.id} className="relative group">
                  <div className="relative w-full h-32 rounded-lg overflow-hidden bg-bg-elevated border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt="Fotoğraf" className="w-full h-full object-cover" />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePhoto(p.id)}
                    className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow"
                    aria-label="Fotoğrafı sil"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {photos.length < MAX_PHOTOS && (
            <label className="inline-flex items-center gap-2 px-lg py-md rounded-lg border-2 border-dashed border-border bg-bg-elevated text-text-sub hover:border-primary hover:text-primary transition cursor-pointer">
              <Upload size={18} />
              <span className="text-sm font-semibold">
                {uploading ? 'Yükleniyor...' : 'Fotoğraf Ekle'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handleAddPhotos(e.target.files)}
                disabled={uploading}
                className="hidden"
              />
            </label>
          )}

          {photoError && (
            <p className="text-sm text-danger mt-sm">{photoError}</p>
          )}
        </div>

        <ErrorBox message={error} />

        <div className="flex gap-md">
          <Link
            href={`/experiences/${experienceId}`}
            className="px-lg py-md rounded-xl bg-bg-elevated text-text font-bold hover:bg-border transition"
          >
            İptal
          </Link>
          <Button type="submit" isLoading={mutation.isPending}>
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  )
}
