import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { RISK_CATEGORY_LABELS } from "@/lib/domain"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { count: slaughterhouseCount },
    { count: visitCount },
    { count: openRiskCount },
    { data: openFindings },
  ] = await Promise.all([
    supabase.from("slaughterhouses").select("*", { count: "exact", head: true }),
    supabase.from("visits").select("*", { count: "exact", head: true }),
    supabase
      .from("risk_findings")
      .select("*", { count: "exact", head: true })
      .neq("status", "dismissed"),
    supabase
      .from("risk_findings")
      .select(
        "category, severity, photo:photos(visit:visits(slaughterhouse:slaughterhouses(id, name)))",
      )
      .neq("status", "dismissed")
      .limit(1000),
  ])

  const categoryCounts = new Map<string, number>()
  const houseCounts = new Map<string, { name: string; count: number }>()

  for (const f of openFindings ?? []) {
    categoryCounts.set(f.category, (categoryCounts.get(f.category) ?? 0) + 1)

    const photo = f.photo as { visit?: { slaughterhouse?: { id?: string; name?: string } } } | null
    const house = photo?.visit?.slaughterhouse
    if (house?.id) {
      const existing = houseCounts.get(house.id)
      houseCounts.set(house.id, { name: house.name ?? "-", count: (existing?.count ?? 0) + 1 })
    }
  }

  const topCategories = [...categoryCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6)
  const topHouses = [...houseCounts.entries()]
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 6)
  const maxCategoryCount = Math.max(1, ...topCategories.map(([, c]) => c))
  const maxHouseCount = Math.max(1, ...topHouses.map(([, v]) => v.count))

  return (
    <div className="space-y-8">
      <h1 className="text-lg font-bold text-gray-900">대시보드</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="등록 도축장" value={slaughterhouseCount ?? 0} />
        <StatCard label="누적 점검 건수" value={visitCount ?? 0} />
        <StatCard label="미해소 위험요인" value={openRiskCount ?? 0} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-3 rounded-md border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700">반복 위험요인 유형 (미해소)</h2>
          {topCategories.length === 0 ? (
            <p className="text-sm text-gray-400">데이터가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {topCategories.map(([category, count]) => (
                <li key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <span>{RISK_CATEGORY_LABELS[category] ?? category}</span>
                    <span>{count}건</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gray-900"
                      style={{ width: `${(count / maxCategoryCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="space-y-3 rounded-md border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-700">도축장별 미해소 위험요인</h2>
          {topHouses.length === 0 ? (
            <p className="text-sm text-gray-400">데이터가 없습니다.</p>
          ) : (
            <ul className="space-y-2">
              {topHouses.map(([houseId, house]) => (
                <li key={houseId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-gray-600">
                    <Link href={`/slaughterhouses/${houseId}`} className="hover:underline">
                      {house.name}
                    </Link>
                    <span>{house.count}건</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className="h-2 rounded-full bg-gray-900"
                      style={{ width: `${(house.count / maxHouseCount) * 100}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <p className="text-sm text-gray-500">
        전체 목록과 상태별 필터는{" "}
        <Link href="/risks" className="underline">
          위험요인
        </Link>{" "}
        메뉴에서 확인할 수 있습니다.
      </p>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
    </div>
  )
}
