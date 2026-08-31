import { createClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ count: slaughterhouseCount }, { count: visitCount }, { count: openRiskCount }] =
    await Promise.all([
      supabase.from("slaughterhouses").select("*", { count: "exact", head: true }),
      supabase.from("visits").select("*", { count: "exact", head: true }),
      supabase
        .from("risk_findings")
        .select("*", { count: "exact", head: true })
        .neq("status", "dismissed"),
    ])

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-bold text-gray-900">대시보드</h1>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="등록 도축장" value={slaughterhouseCount ?? 0} />
        <StatCard label="누적 점검 건수" value={visitCount ?? 0} />
        <StatCard label="미해소 위험요인" value={openRiskCount ?? 0} />
      </div>
      <p className="text-sm text-gray-500">
        도축장별/기간별 통계와 반복 위험 랭킹은 위험요인 대시보드 단계에서 이 화면에 추가됩니다.
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
