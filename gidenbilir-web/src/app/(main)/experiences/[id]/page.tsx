import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getExperience, getComments, getSimilarExperiences } from '@/lib/api'
import { PhotoGallery } from '@/components/detail/PhotoGallery'
import { VideoPlayer } from '@/components/ui/VideoPlayer'
import { LikeButton } from '@/components/detail/LikeButton'
import { AskQuestionButton } from '@/components/detail/AskQuestionButton'
import { CommentSection } from '@/components/detail/CommentSection'
import { SimilarExperiences } from '@/components/detail/SimilarExperiences'
import { BackLink } from '@/components/detail/BackLink'

interface DetailPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params,
}: DetailPageProps): Promise<Metadata> {
  try {
    const { id } = await params
    const { data: experience } = await getExperience(Number(id))

    const description = experience.description?.slice(0, 160) ?? ''
    const image = experience.photoUrls?.[0]

    return {
      title: experience.title,
      description,
      openGraph: {
        title: experience.title,
        description,
        type: 'website',
        url: `/experiences/${id}`,
        images: image ? [{ url: image }] : [],
      },
      twitter: {
        card: 'summary_large_image',
        title: experience.title,
        description,
        images: image ? [image] : [],
      },
    }
  } catch {
    return { title: 'Deneyim' }
  }
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { id } = await params
  const numId = Number(id)

  try {
    // Parallel fetch
    const [experienceRes] = await Promise.all([
      getExperience(numId),
      getComments(numId),
      getSimilarExperiences(numId),
    ]).catch((err) => {
      console.error('[detail] fetch error:', err)
      throw err
    })

    const experience = experienceRes.data

    if (!experience) {
      notFound()
    }

    return (
      <div className="container-content py-xl">
        <article>
          {/* Back Link */}
          <BackLink />

          {/* Grid Layout: Photo left, Info right (desktop) */}
          <div className="grid lg:grid-cols-[3fr_2fr] gap-2xl mb-2xl">
            {/* Photo Gallery + Video */}
            <div className="space-y-lg">
              <PhotoGallery
                photoUrls={experience.photoUrls}
                title={experience.title}
                countryFlag={experience.countryFlag}
                countryName={experience.countryName}
                city={experience.city}
              />
              {experience.videoUrl && (
                <VideoPlayer
                  src={experience.videoUrl}
                  title={experience.title}
                  className="aspect-video w-full"
                />
              )}
            </div>

            {/* Info Section */}
            <div className="space-y-lg">
              {/* Title */}
              <div>
                <h1 className="mb-md text-[28px] font-extrabold tracking-tight">
                  {experience.title}
                </h1>

                {/* Author */}
                <div className="flex items-center gap-2 mb-md">
                  <span aria-hidden="true">{experience.authorNationalityFlag}</span>
                  <span className="text-text-sub">
                    {experience.authorName} tarafından
                  </span>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1.5 text-text-sub mb-md">
                  <span aria-hidden="true">{experience.countryFlag}</span>
                  <span>
                    {experience.city && `${experience.city}, `}
                    {experience.countryName}
                  </span>
                </div>

                {/* Category & Rating */}
                <div className="flex items-center gap-4 flex-wrap">
                  <span className="text-[13px] bg-primary-light text-primary px-3 py-1 rounded-full font-semibold">
                    <span aria-hidden="true">{experience.categoryIcon}</span>{' '}
                    {experience.categoryName}
                  </span>
                  {experience.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <span
                          key={star}
                          className={
                            star <= Math.round(experience.rating)
                              ? 'text-accent'
                              : 'text-text-mute'
                          }
                          aria-hidden="true"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="space-y-lg border-y border-border py-lg">
                <div className="text-sm">
                  <span className="text-text-sub">Beğeni</span>
                  <div className="mt-sm">
                    <LikeButton
                      experienceId={experience.id}
                      initialLikeCount={experience.likeCount}
                      initialIsLiked={experience.isLikedByMe}
                    />
                  </div>
                </div>
                <AskQuestionButton authorId={experience.authorId} authorName={experience.authorName} />
              </div>

              {/* Description */}
              <div>
                <h2 className="text-[15px] font-bold mb-md">Hakkında</h2>
                <p className="text-[14px] leading-relaxed text-text">
                  {experience.description || 'Açıklama yok'}
                </p>
              </div>

              {/* Details */}
              <div className="space-y-sm text-[13px]">
                {experience.budgetLevel && (
                  <div>
                    <span className="text-text-sub">Bütçe Seviyesi: </span>
                    <span className="font-semibold text-text">
                      {experience.budgetLevel}
                    </span>
                  </div>
                )}
                {experience.visitDate && (
                  <div>
                    <span className="text-text-sub">Ziyaret Tarihi: </span>
                    <span className="font-semibold text-text">
                      {new Date(experience.visitDate).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Comments */}
          <section className="mb-2xl border-t border-border pt-2xl">
            <CommentSection experienceId={id} />
          </section>

          {/* Similar Experiences */}
          <section className="border-t border-border pt-2xl">
            <SimilarExperiences experienceId={id} />
          </section>
        </article>
      </div>
    )
  } catch (error) {
    console.error('[detail-page] error:', error)
    notFound()
  }
}
