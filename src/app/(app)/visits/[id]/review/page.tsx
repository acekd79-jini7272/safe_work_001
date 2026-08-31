import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { RISK_CATEGORY_LABELS, RISK_STATUS_LABELS, SEVERITY_LABELS } from "@/lib/domain"
import { confirmFinding, dismissFinding, finishReview, updateFinding } from "./actions"

export default async function ReviewVisitPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: visit } = await supabase
    .from("visits")
    .select("id, status, slaughterhouse:slaughterhouses(name)")
    .eq("id", id)
    .single()

  if (!visit) {
    notFound()
  }
  const slaughterhouse = visit.slaughterhouse as { name?: string } | null

  const [{ data: photos }, { data: profiles }] = await Promise.all([
    supabase
      .from("photos")
      .select(
        "id, sequence_no, file_path, ai_status, checkpoint_type:checkpoint_types(name), risk_findings(*)",
      )
      .eq("visit_id", id)
      .order("sequence_no"),
    supabase.from("profiles").select("id, name").order("name"),
  ])

  const photosWithUrls = await Promise.all(
    (photos ?? []).map(async (photo) => {
      const { data: signed } = await supabase.storage
        .from("visit-photos")
        .createSignedUrl(photo.file_path, 3600)
      return { ...photo, url: signed?.signedUrl ?? null }
    }),
  )

  const totalFindings = photosWithUrls.reduce(
    (sum, p) => sum + ((p.risk_findings as unknown[] | null)?.length ?? 0),
    0,
  )

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500">{slaughterhouse?.name}</p>
          <h1 className="text-lg font-bold text-gray-900">AI 분석 결과 검토</h1>
          <p className="mt-1 text-sm text-gray-500">
            사진 {photosWithUrls.length}장 · 위험요인 {totalFindings}건
          </p>
        </div>
        <form action={finishReview.bind(null, id)}>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            검토 완료
          </button>
        </form>
      </div>

      <div className="space-y-6">
        {photosWithUrls.map((photo) => {
          const checkpoint = photo.checkpoint_type as { name?: string } | null
          const findings = (photo.risk_findings as Array<{
            id: string
            category: string
            severity: string
            description: string
            regulation_ref: string | null
            status: string
          }>) ?? []

          return (
            <div key={photo.id} className="rounded-md border border-gray-200 bg-white p-4">
              <div className="mb-3 flex gap-4">
                {photo.url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.url}
                    alt={`사진 ${photo.sequence_no}`}
                    className="h-24 w-24 shrink-0 rounded-md object-cover"
                  />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    #{photo.sequence_no} {checkpoint?.name ?? "이동동선"}
                  </p>
                  <p className="text-xs text-gray-500">분석상태: {photo.ai_status}</p>
                </div>
              </div>

              {findings.length === 0 ? (
                <p className="text-sm text-gray-400">식별된 위험요인이 없습니다.</p>
              ) : (
                <div className="space-y-4">
                  {findings.map((finding) => (
                    <FindingCard
                      key={finding.id}
                      visitId={id}
                      finding={finding}
                      profiles={profiles ?? []}
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FindingCard({
  visitId,
  finding,
  profiles,
}: {
  visitId: string
  finding: {
    id: string
    category: string
    severity: string
    description: string
    regulation_ref: string | null
    status: string
  }
  profiles: { id: string; name: string }[]
}) {
  const isFinal = finding.status === "confirmed" || finding.status === "dismissed"

  return (
    <div className="rounded-md border border-gray-100 bg-gray-50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-white px-2 py-0.5 text-xs text-gray-600">
          {RISK_STATUS_LABELS[finding.status] ?? finding.status}
        </span>
      </div>

      <form
        action={updateFinding.bind(null, visitId, finding.id)}
        className="grid grid-cols-1 gap-2 sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">위험요인 유형</label>
          <select
            name="category"
            defaultValue={finding.category}
            disabled={isFinal}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            {Object.entries(RISK_CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">위험도</label>
          <select
            name="severity"
            defaultValue={finding.severity}
            disabled={isFinal}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          >
            {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700">
            위험요인 설명 / 1차 대응방안
          </label>
          <textarea
            name="description"
            defaultValue={finding.description}
            disabled={isFinal}
            rows={3}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-700">관련 법령/기준</label>
          <input
            name="regulation_ref"
            defaultValue={finding.regulation_ref ?? ""}
            disabled={isFinal}
            className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
          />
        </div>
        {!isFinal && (
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-white"
            >
              수정 저장
            </button>
          </div>
        )}
      </form>

      {!isFinal && (
        <form
          action={confirmFinding.bind(null, visitId, finding.id)}
          className="mt-3 grid grid-cols-1 gap-2 border-t border-gray-200 pt-3 sm:grid-cols-3"
        >
          <input type="hidden" name="action_description" value={finding.description} />
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">조치 담당자</label>
            <select
              name="assignee_id"
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            >
              <option value="">미지정</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">조치 기한</label>
            <input
              type="date"
              name="due_date"
              className="w-full rounded-md border border-gray-300 px-2 py-1.5 text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex-1 rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              확정 및 조치 등록
            </button>
          </div>
        </form>
      )}

      {!isFinal && (
        <form action={dismissFinding.bind(null, visitId, finding.id)} className="mt-2">
          <button type="submit" className="text-xs text-red-600 hover:underline">
            반려
          </button>
        </form>
      )}
    </div>
  )
}
