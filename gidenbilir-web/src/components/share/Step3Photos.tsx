'use client'

import { useState, useCallback } from 'react'
import { X, Upload } from 'lucide-react'

interface PhotoPreview {
  id: string
  file: File
  preview: string
}

interface Step3PhotosProps {
  photos: PhotoPreview[]
  onPhotosChange: (photos: PhotoPreview[]) => void
}

const MAX_PHOTOS = 5
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export function Step3Photos({ photos, onPhotosChange }: Step3PhotosProps) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handlePhotos = useCallback(
    (files: FileList | null) => {
      setError(null)

      if (!files) return

      const newFiles = Array.from(files).filter((file) => {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Sadece resim dosyaları yüklenebilir.')
          return false
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          setError('Dosya boyutu 10MB\'den az olmalıdır.')
          return false
        }

        return true
      })

      if (newFiles.length === 0) return

      const remainingSlots = MAX_PHOTOS - photos.length
      const filesToAdd = newFiles.slice(0, remainingSlots)

      const photoPreviewsToAdd: PhotoPreview[] = filesToAdd.map((file) => ({
        id: `${Date.now()}-${Math.random()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

      const updatedPhotos = [...photos, ...photoPreviewsToAdd]
      onPhotosChange(updatedPhotos)

      if (updatedPhotos.length >= MAX_PHOTOS) {
        setError(`Maksimum ${MAX_PHOTOS} fotoğraf yükleyebilirsiniz.`)
      }
    },
    [photos, onPhotosChange]
  )

  const removePhoto = (id: string) => {
    const updatedPhotos = photos.filter((p) => p.id !== id)
    onPhotosChange(updatedPhotos)
    setError(null)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    handlePhotos(e.dataTransfer.files)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handlePhotos(e.target.files)
  }

  return (
    <div className="space-y-lg">
      <h2 className="text-[22px] font-bold text-text">Fotoğraf Yükleyin</h2>

      {/* Error Message */}
      {error && (
        <div className="p-md rounded-lg bg-danger-light border border-danger text-danger text-sm">
          {error}
        </div>
      )}

      {/* Drag-Drop Area */}
      {photos.length < MAX_PHOTOS && (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-2xl text-center transition ${
            dragActive
              ? 'border-primary bg-primary-light'
              : 'border-border bg-bg-elevated'
          }`}
        >
          <Upload className="mx-auto mb-md text-primary" size={40} />
          <p className="font-semibold text-text mb-sm">Fotoğrafları buraya sürükleyin</p>
          <p className="text-text-mute text-sm mb-lg">veya</p>
          <label className="inline-block">
            <span className="bg-primary text-white px-lg py-md rounded-full font-semibold cursor-pointer hover:bg-primary-dark transition">
              Dosya Seçin
            </span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleInputChange}
              className="hidden"
              aria-label="Fotoğraf yükle"
            />
          </label>
          <p className="text-[12px] text-text-mute mt-lg">
            JPG, PNG, GIF — Maksimum {MAX_PHOTOS} fotoğraf, her biri 10MB&apos;dan az
          </p>
        </div>
      )}

      {/* Photo Preview Grid */}
      {photos.length > 0 && (
        <div>
          <p className="text-sm font-semibold mb-sm text-text">
            Yüklenen Fotoğraflar ({photos.length}/{MAX_PHOTOS})
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-lg">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="relative w-full h-40 rounded-lg overflow-hidden bg-bg-elevated border border-border">
                  <img
                    src={photo.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <button
                  onClick={() => removePhoto(photo.id)}
                  className="absolute -top-2 -right-2 bg-danger text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  aria-label="Fotoğrafı kaldır"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Info — isteğe bağlı */}
      {photos.length === 0 && (
        <div className="p-lg rounded-lg bg-bg-elevated border border-border">
          <p className="text-sm text-text-sub">
            Fotoğraf yüklemek <strong>isteğe bağlıdır</strong>. Fotoğrafsız da paylaşabilirsiniz.
          </p>
        </div>
      )}
    </div>
  )
}
