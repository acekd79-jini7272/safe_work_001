import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ACTION_STATUS_LABELS, ACTION_STATUS_ORDER } from "@/lib/domain"
import { updateActionAssignment, updateActionStatus } from "../actions"

export default async function ActionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: item } = await supabase
    .from("action_items")
    .select(
      "*, assignee:profiles(id, name), risk_finding:risk_findings(id, category, description, photo:photos(visit:visits(slaughterhouse:slaughterhouses(id, name))))",
    )
    .eq("id", id)
    .single()

  if (!item) {
    notFound()
  }

  const [{ data: profiles }, { data: logs }] = await Promise.all([
    supabase.from("profiles").select("id, name").order("name"),
    supabase
      .from("action_status_logs")
      .select("id, from_status, to_status, changed_at, changed_by:profiles(name)")
      .eq("action_item_id", id)
      .order("changed_at", { ascending: false }),
  ])

  const riskFinding = item.risk_finding as {
    id: string
    photo?: { visit?: { slaughterhouse?: { id: string; name: string } } }
  } | null
  const currentIndex = ACTION_STATUS_ORDER.indexOf(
    item.status as (typeof ACTION_STATUS_ORDER)[number],
  )
  const nextStatus = ACTION_STATUS_ORDER[currentIndex + 1]

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <p className="text-xs text-gray-500">
          <Link
            href={`/slaughterhouses/${riskFinding?.photo?.visit?.slaughterhouse?.id}`}
            className="hover:underline"
          >
            {riskFinding?.photo?.visit?.slaughterhouse?.name}
          </Link>{" "}
          ·{" "}
          <Link href={`/risks/${riskFinding?.id}`} className="hover:underline">
            관련 위험요인 보기
          </Link>
        </p>
        <h1 className="text-lg font-bold text-gray-900">조치 상세</h1>
      </div>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600">
          {ACTION_STATUS_LABELS[item.status] ?? item.status}
        </span>
        {nextStatus && (
          <form action={updateActionStatus.bind(null, id, nextStatus)}>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-800"
            >
              {ACTION_STATUS_LABELS[nextStatus]}(으)로 진행
            </button>
          </form>
        )}
      </div>

      <form action={updateActionAssignment.bind(null, id)} className="space-y-4 rounded-md border border-gray-200 bg-white p-4">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">조치 내용</label>
          <textarea
            name="action_description"
            defaultValue={item.action_description}
            rows={4}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">담당자</label>
            <select
              name="assignee_id"
              defaultValue={item.assignee_id ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="">미지정</option>
              {(profiles ?? []).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">기한</label>
            <input
              type="date"
              name="due_date"
              defaultValue={item.due_date ?? ""}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          저장
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">상태 변경 이력</h2>
        {!logs || logs.length === 0 ? (
          <p className="text-sm text-gray-400">이력이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {logs.map((log) => {
              const changedBy = log.changed_by as { name?: string } | null
              return (
                <li key={log.id} className="text-xs text-gray-500">
                  {new Date(log.changed_at).toLocaleString("ko-KR")} ·{" "}
                  {log.from_status ? ACTION_STATUS_LABELS[log.from_status] : "생성"} →{" "}
                  {ACTION_STATUS_LABELS[log.to_status] ?? log.to_status}
                  {changedBy?.name ? ` (${changedBy.name})` : ""}
                </li>
              )
            })}
          </ul>
        )}
      </section>
    </div>
  )
}
