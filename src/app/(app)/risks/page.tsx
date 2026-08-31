import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import {
  RISK_CATEGORY_LABELS,
  RISK_STATUS_LABELS,
  SEVERITY_LABELS,
} from "@/lib/domain"

type SearchParams = {
  status?: string
  category?: string
  severity?: string
  slaughterhouse_id?: string
}

export default async function RisksPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  const filters = await searchParams
  const supabase = await createClient()

  const { data: slaughterhouses } = await supabase
    .from("slaughterhouses")
    .select("id, name")
    .order("name")

  let query = supabase
    .from("risk_findings")
    .select(
      "id, category, severity, status, description, created_at, photo:photos(sequence_no, visit:visits(visit_date, slaughterhouse:slaughterhouses(id, name)))",
    )
    .order("created_at", { ascending: false })
    .limit(200)

  if (filters.status) query = query.eq("status", filters.status)
  if (filters.category) query = query.eq("category", filters.category)
  if (filters.severity) query = query.eq("severity", filters.severity)

  const { data: findings } = await query

  const filtered = (findings ?? []).filter((f) => {
    if (!filters.slaughterhouse_id) return true
    const photo = f.photo as { visit?: { slaughterhouse?: { id?: string } } } | null
    return photo?.visit?.slaughterhouse?.id === filters.slaughterhouse_id
  })

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-900">위험요인</h1>

      <form className="flex flex-wrap gap-2">
        <Select name="status" label="상태" value={filters.status} options={RISK_STATUS_LABELS} />
        <Select
          name="category"
          label="유형"
          value={filters.category}
          options={RISK_CATEGORY_LABELS}
        />
        <Select
          name="severity"
          label="위험도"
          value={filters.severity}
          options={SEVERITY_LABELS}
        />
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-700">도축장</label>
          <select
            name="slaughterhouse_id"
            defaultValue={filters.slaughterhouse_id ?? ""}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            <option value="">전체</option>
            {(slaughterhouses ?? []).map((house) => (
              <option key={house.id} value={house.id}>
                {house.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            필터 적용
          </button>
        </div>
      </form>

      {filtered.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          조건에 맞는 위험요인이 없습니다.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs text-gray-500">
              <tr>
                <th className="px-3 py-2">도축장</th>
                <th className="px-3 py-2">점검일</th>
                <th className="px-3 py-2">유형</th>
                <th className="px-3 py-2">위험도</th>
                <th className="px-3 py-2">상태</th>
                <th className="px-3 py-2">설명</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f) => {
                const photo = f.photo as {
                  visit?: { visit_date?: string; slaughterhouse?: { name?: string } }
                } | null
                return (
                  <tr key={f.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <Link href={`/risks/${f.id}`} className="hover:underline">
                        {photo?.visit?.slaughterhouse?.name ?? "-"}
                      </Link>
                    </td>
                    <td className="px-3 py-2 text-gray-500">{photo?.visit?.visit_date ?? "-"}</td>
                    <td className="px-3 py-2">{RISK_CATEGORY_LABELS[f.category] ?? f.category}</td>
                    <td className="px-3 py-2">
                      <SeverityBadge severity={f.severity} />
                    </td>
                    <td className="px-3 py-2 text-gray-500">
                      {RISK_STATUS_LABELS[f.status] ?? f.status}
                    </td>
                    <td className="max-w-xs truncate px-3 py-2 text-gray-600">{f.description}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function Select({
  name,
  label,
  value,
  options,
}: {
  name: string
  label: string
  value?: string
  options: Record<string, string>
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-700">{label}</label>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="">전체</option>
        {Object.entries(options).map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
    </div>
  )
}

function SeverityBadge({ severity }: { severity: string }) {
  const color =
    severity === "high"
      ? "bg-red-100 text-red-700"
      : severity === "medium"
        ? "bg-amber-100 text-amber-700"
        : "bg-gray-100 text-gray-600"
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs ${color}`}>
      {SEVERITY_LABELS[severity] ?? severity}
    </span>
  )
}
