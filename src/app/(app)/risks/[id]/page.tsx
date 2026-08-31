import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import {
  ACTION_STATUS_LABELS,
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  SEVERITY_LABELS,
} from "@/lib/domain"

export default async function RiskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: finding } = await supabase
    .from("risk_findings")
    .select(
      "*, photo:photos(sequence_no, file_path, checkpoint_type:checkpoint_types(name), visit:visits(id, visit_date, slaughterhouse:slaughterhouses(id, name)))",
    )
    .eq("id", id)
    .single()

  if (!finding) {
    notFound()
  }

  const photo = finding.photo as {
    sequence_no: number
    file_path: string
    checkpoint_type?: { name?: string }
    visit?: { id: string; visit_date: string; slaughterhouse?: { id: string; name: string } }
  } | null

  const { data: signed } = photo
    ? await supabase.storage.from("visit-photos").createSignedUrl(photo.file_path, 3600)
    : { data: null }

  const { data: actionItems } = await supabase
    .from("action_items")
    .select("id, action_description, status, due_date, assignee:profiles(name)")
    .eq("risk_finding_id", id)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <p className="text-xs text-gray-500">
          <Link href={`/slaughterhouses/${photo?.visit?.slaughterhouse?.id}`} className="hover:underline">
            {photo?.visit?.slaughterhouse?.name}
          </Link>{" "}
          · {photo?.visit?.visit_date} · #{photo?.sequence_no} {photo?.checkpoint_type?.name ?? "이동동선"}
        </p>
        <h1 className="text-lg font-bold text-gray-900">
          {RISK_CATEGORY_LABELS[finding.category] ?? finding.category}
        </h1>
      </div>

      {signed?.signedUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={signed.signedUrl} alt="위험요인 사진" className="max-h-96 rounded-md object-contain" />
      )}

      <div className="flex gap-2">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          위험도: {SEVERITY_LABELS[finding.severity] ?? finding.severity}
        </span>
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
          상태: {RISK_STATUS_LABELS[finding.status] ?? finding.status}
        </span>
        {finding.ai_generated && (
          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs text-blue-700">AI 초안</span>
        )}
      </div>

      <div className="rounded-md border border-gray-200 bg-white p-4">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{finding.description}</p>
        {finding.regulation_ref && (
          <p className="mt-2 text-xs text-gray-500">관련 법령/기준: {finding.regulation_ref}</p>
        )}
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">조치 이력</h2>
        {!actionItems || actionItems.length === 0 ? (
          <p className="text-sm text-gray-400">
            등록된 조치가 없습니다. 위험요인이 확정되면 검토 화면에서 조치를 등록할 수 있습니다.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
            {actionItems.map((item) => {
              const assignee = item.assignee as { name?: string } | null
              return (
                <li key={item.id} className="px-4 py-3">
                  <Link href={`/actions/${item.id}`} className="text-sm text-gray-900 hover:underline">
                    {item.action_description}
                  </Link>
                  <p className="mt-1 text-xs text-gray-500">
                    {ACTION_STATUS_LABELS[item.status] ?? item.status} · 담당자:{" "}
                    {assignee?.name ?? "미지정"} · 기한: {item.due_date ?? "-"}
                  </p>
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
