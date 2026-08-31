import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { runAnalysis } from "./actions"

export const maxDuration = 60

export default async function AnalyzeVisitPage({
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

  const { count: pendingCount } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("visit_id", id)
    .eq("ai_status", "pending")

  const { count: totalCount } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("visit_id", id)

  const hasKey = Boolean(process.env.ANTHROPIC_API_KEY)

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <p className="text-xs text-gray-500">{slaughterhouse?.name}</p>
        <h1 className="text-lg font-bold text-gray-900">AI 위험요인 분석</h1>
      </div>

      {!hasKey && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          ANTHROPIC_API_KEY가 설정되지 않아 지금은 예시(Mock) 결과로 진행됩니다. 실제 Claude
          vision 분석을 사용하려면 환경변수를 설정해주세요.
        </p>
      )}

      <p className="text-sm text-gray-600">
        총 {totalCount ?? 0}장 중 {pendingCount ?? 0}장이 분석 대기 중입니다. 분석을 시작하면
        사진별로 위험요인과 1차 대응방안 초안이 생성됩니다.
      </p>

      {(pendingCount ?? 0) > 0 ? (
        <form action={runAnalysis.bind(null, id)}>
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            분석 시작
          </button>
        </form>
      ) : (
        <a
          href={`/visits/${id}/review`}
          className="block w-full rounded-md bg-gray-900 px-3 py-2 text-center text-sm font-medium text-white hover:bg-gray-800"
        >
          분석할 사진 없음 → 검토로 이동
        </a>
      )}
    </div>
  )
}
