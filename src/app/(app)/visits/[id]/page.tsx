import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MAX_PHOTOS_PER_VISIT, VISIT_STATUS_LABELS } from "@/lib/domain"
import { addPhoto, deletePhoto, markPhotosDone } from "../actions"

export default async function VisitDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ error?: string }>
}) {
  const { id } = await params
  const { error } = await searchParams
  const supabase = await createClient()

  const { data: visit } = await supabase
    .from("visits")
    .select("id, status, visit_date, slaughterhouse:slaughterhouses(id, name)")
    .eq("id", id)
    .single()

  if (!visit) {
    notFound()
  }

  const slaughterhouse = visit.slaughterhouse as { id: string; name: string } | null

  const [{ data: checkpointTypes }, { data: photos }] = await Promise.all([
    supabase
      .from("checkpoint_types")
      .select("id, name, is_required")
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("photos")
      .select("id, sequence_no, file_path, checkpoint_type_id, ai_status, checkpoint_type:checkpoint_types(name)")
      .eq("visit_id", id)
      .order("sequence_no"),
  ])

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("visit-photos")
        .createSignedUrl(photo.file_path, 3600)
      return { ...photo, url: signed?.signedUrl ?? null }
    }),
  )

  const coveredCheckpointIds = new Set(
    (photos ?? []).map((p) => p.checkpoint_type_id).filter(Boolean),
  )
  const photoCount = photos?.length ?? 0
  const atLimit = photoCount >= MAX_PHOTOS_PER_VISIT

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">
            <Link href={`/slaughterhouses/${slaughterhouse?.id}`} className="hover:underline">
              {slaughterhouse?.name}
            </Link>
          </p>
          <h1 className="text-lg font-bold text-gray-900">{visit.visit_date} 점검</h1>
        </div>
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {VISIT_STATUS_LABELS[visit.status] ?? visit.status}
        </span>
      </div>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">필수 점검포인트 체크</h2>
        <div className="flex flex-wrap gap-2">
          {(checkpointTypes ?? []).map((cp) => {
            const covered = coveredCheckpointIds.has(cp.id)
            return (
              <span
                key={cp.id}
                className={`rounded-full px-3 py-1 text-xs ${
                  covered
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {covered ? "✓ " : ""}
                {cp.name}
                {cp.is_required ? "" : " (선택)"}
              </span>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-700">사진 업로드</h2>
          <span className="text-sm text-gray-500">
            {photoCount} / {MAX_PHOTOS_PER_VISIT}
          </span>
        </div>

        {!atLimit && (
          <form
            action={addPhoto.bind(null, id)}
            encType="multipart/form-data"
            className="flex flex-wrap items-end gap-2 rounded-md border border-gray-200 bg-white p-3"
          >
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-700">점검포인트</label>
              <select
                name="checkpoint_type_id"
                className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              >
                <option value="">(이동동선 / 미지정)</option>
                {(checkpointTypes ?? []).map((cp) => (
                  <option key={cp.id} value={cp.id}>
                    {cp.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[220px]">
              <label className="mb-1 block text-xs font-medium text-gray-700">사진 촬영/선택</label>
              <input
                name="photo"
                type="file"
                accept="image/*"
                capture="environment"
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              업로드 ({photoCount + 1}번째)
            </button>
          </form>
        )}
        {atLimit && (
          <p className="text-sm text-gray-500">
            최대 {MAX_PHOTOS_PER_VISIT}장까지 업로드했습니다.
          </p>
        )}

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photosWithUrls.map((photo) => {
            const checkpoint = photo.checkpoint_type as { name?: string } | null
            return (
              <div key={photo.id} className="overflow-hidden rounded-md border border-gray-200 bg-white">
                {photo.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.url} alt={`사진 ${photo.sequence_no}`} className="h-32 w-full object-cover" />
                ) : (
                  <div className="flex h-32 items-center justify-center text-xs text-gray-400">
                    이미지 로드 실패
                  </div>
                )}
                <div className="space-y-1 p-2">
                  <p className="text-xs font-medium text-gray-700">
                    #{photo.sequence_no} {checkpoint?.name ?? "이동동선"}
                  </p>
                  <form action={deletePhoto.bind(null, id, photo.id, photo.file_path)}>
                    <button type="submit" className="text-xs text-red-600 hover:underline">
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {photoCount > 0 && (
        <form action={markPhotosDone.bind(null, id)}>
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 sm:w-auto"
          >
            업로드 완료 → AI 분석으로 이동
          </button>
        </form>
      )}
    </div>
  )
}
