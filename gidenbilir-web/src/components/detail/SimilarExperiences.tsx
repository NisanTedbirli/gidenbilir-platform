'use client'

import { useQuery } from '@tanstack/react-query'
import { getSimilarExperiences } from '@/lib/api'
import { ExperienceCard } from '@/components/feed/ExperienceCard'

interface SimilarExperiencesProps {
  experienceId: string
}

export function SimilarExperiences({ experienceId }: SimilarExperiencesProps) {
  const numId = Number(experienceId)
  const { data: similarData = [], isLoading } = useQuery({
    queryKey: ['similar', experienceId],
    queryFn: async () => {
      const response = await getSimilarExperiences(numId)
      return response.data
    },
  })

  const similar = similarData

  if (isLoading) {
    return (
      <div className="space-y-lg">
        <h3 className="text-[18px] font-bold text-text">Benzer Deneyimler</h3>
        <div className="text-center py-lg text-text-sub">Yükleniyor...</div>
      </div>
    )
  }

  if (similar.length === 0) {
    return null
  }

  return (
    <div className="space-y-lg">
      <h3 className="text-[18px] font-bold text-text">Benzer Deneyimler</h3>
      <div className="overflow-x-auto pb-2 -mx-lg px-lg">
        <div className="flex gap-lg">
          {similar.map((exp) => (
            <div key={exp.id} className="w-60 flex-shrink-0">
              <ExperienceCard experience={exp} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
