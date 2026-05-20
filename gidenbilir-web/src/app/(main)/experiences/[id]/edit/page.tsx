import { EditExperienceForm } from '@/components/detail/EditExperienceForm'

export default async function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const numId = Number(id)

  if (!Number.isFinite(numId) || numId <= 0) {
    return (
      <div className="container-content py-xl">
        <p className="text-text-sub">Geçersiz paylaşım.</p>
      </div>
    )
  }

  return (
    <div className="container-content py-xl">
      <EditExperienceForm experienceId={numId} />
    </div>
  )
}
