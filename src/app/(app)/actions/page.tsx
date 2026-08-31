import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { ACTION_STATUS_LABELS, ACTION_STATUS_ORDER } from "@/lib/domain"

export default async function ActionsPage({
  searchParams,
}: {
  searchParams: Promise<{ mine?: string }>
}) {
  const { mine } = await searchParams
  const profile = await requireProfile()
  const supabase = await createClient()

  let query = supabase
    .from("action_items")
    .select(
      "id, action_description, status, due_date, assignee:profiles(id, name), risk_finding:risk_findings(category, photo:photos(visit:visits(slaughterhouse:slaughterhouses(name))))",
    )
    .order("due_date", { ascending: true, nullsFirst: false })

  if (mine === "1") {
    query = query.eq("assignee_id", profile.id)
  }

  const { data: items } = await query

  const columns = ACTION_STATUS_ORDER.map((status) => ({
    status,
    items: (items ?? []).filter((item) => item.status === status),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">조치 관리</h1>
        <div className="flex gap-2 text-sm">
          <Link
            href="/actions"
            className={`rounded-md px-3 py-1.5 ${!mine ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
          >
            전체
          </Link>
          <Link
            href="/actions?mine=1"
            className={`rounded-md px-3 py-1.5 ${mine === "1" ? "bg-gray-900 text-white" : "border border-gray-300 text-gray-700"}`}
          >
            내 조치함
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {columns.map((col) => (
          <div key={col.status} className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-700">
              {ACTION_STATUS_LABELS[col.status]} ({col.items.length})
            </h2>
            <div className="space-y-2">
              {col.items.map((item) => {
                const riskFinding = item.risk_finding as {
                  category?: string
                  photo?: { visit?: { slaughterhouse?: { name?: string } } }
                } | null
                const assignee = item.assignee as { name?: string } | null
                return (
                  <Link
                    key={item.id}
                    href={`/actions/${item.id}`}
                    className="block rounded-md border border-gray-200 bg-white p-3 hover:border-gray-400"
                  >
                    <p className="text-xs text-gray-500">
                      {riskFinding?.photo?.visit?.slaughterhouse?.name ?? "-"}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-gray-900">
                      {item.action_description}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {assignee?.name ?? "미지정"} · {item.due_date ?? "기한 없음"}
                    </p>
                  </Link>
                )
              })}
              {col.items.length === 0 && (
                <p className="rounded-md border border-dashed border-gray-200 p-3 text-center text-xs text-gray-400">
                  없음
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
