'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Edit, Trash2 } from 'lucide-react'
import { deleteExperience } from '@/lib/api'
import { ExperienceCard } from '@/components/feed/ExperienceCard'
import type { Experience } from '@/types'

interface UserExperiencesGridProps {
  experiences: Experience[]
  isLoading: boolean
  isOwner: boolean
  onChange: () => void
}

export function UserExperiencesGrid({
  experiences,
  isLoading,
  isOwner,
  onChange,
}: UserExperiencesGridProps) {
  const queryClient = useQueryClient()
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteExperience(id),
    onSuccess: () => {
      setConfirmDeleteId(null)
      setError(null)
      onChange()
      queryClient.invalidateQueries({ queryKey: ['experiences'] })
    },
    onError: () => {
      setError('Paylaşım silinemedi. Lütfen tekrar deneyin.')
    },
  })

  if (isLoading) {
    return <p className="text-text-sub text-center py-xl">Yükleniyor...</p>
  }

  if (experiences.length === 0) {
    return (
      <div className="text-center py-2xl">
        <p className="text-text-sub mb-md">Henüz paylaşım yok.</p>
        {isOwner && (
          <Link
            href="/share"
            className="text-primary font-bold hover:underline"
          >
            İlk paylaşımını yap →
          </Link>
        )}
      </div>
    )
  }

  return (
    <>
      {error && (
        <div className="mb-md rounded-lg bg-danger-light text-danger px-md py-sm text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative">
            <ExperienceCard experience={exp} />

            {isOwner && (
              <div className="absolute right-3 top-3 z-10 flex gap-1.5">
                <Link
                  href={`/experiences/${exp.id}/edit`}
                  className="flex items-center justify-center size-9 rounded-full bg-white/95 text-text hover:bg-white shadow-md transition"
                  aria-label="Paylaşımı düzenle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit size={16} />
                </Link>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setConfirmDeleteId(exp.id)
                  }}
                  className="flex items-center justify-center size-9 rounded-full bg-white/95 text-danger hover:bg-white shadow-md transition"
                  aria-label="Paylaşımı sil"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirm delete modal */}
      {confirmDeleteId !== null && (
        <div
          className="fixed inset-0 z-modal flex items-center justify-center bg-black/50 p-lg"
          role="dialog"
          aria-modal="true"
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className="bg-bg-surface rounded-2xl p-xl max-w-md w-full shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-[18px] font-bold mb-sm">Paylaşımı sil?</h3>
            <p className="text-text-sub mb-lg">
              Bu işlem geri alınamaz. Paylaşımla birlikte tüm fotoğraflar,
              yorumlar ve beğeniler silinecek.
            </p>
            <div className="flex gap-md justify-end">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                disabled={deleteMutation.isPending}
                className="px-lg py-sm rounded-xl bg-bg-elevated text-text font-bold hover:bg-border transition disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={() => deleteMutation.mutate(confirmDeleteId)}
                disabled={deleteMutation.isPending}
                className="px-lg py-sm rounded-xl bg-danger text-white font-bold hover:brightness-110 transition disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Siliniyor...' : 'Sil'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
