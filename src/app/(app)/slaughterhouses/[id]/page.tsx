import Link from "next/link"
import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ANIMAL_TYPE_LABELS, ROLE_LABELS, VISIT_STATUS_LABELS } from "@/lib/domain"
import { addTeamMember } from "../actions"
import { startVisit } from "@/app/(app)/visits/actions"

export default async function SlaughterhouseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const [{ data: house }, { data: visits }, { data: members }] = await Promise.all([
    supabase.from("slaughterhouses").select("*").eq("id", id).single(),
    supabase
      .from("visits")
      .select("id, visit_date, status, inspector:profiles(name)")
      .eq("slaughterhouse_id", id)
      .order("visit_date", { ascending: false }),
    supabase
      .from("slaughterhouse_members")
      .select("id, role, profile:profiles(name, email)")
      .eq("slaughterhouse_id", id),
  ])

  if (!house) {
    notFound()
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900">{house.name}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {[house.region, house.address].filter(Boolean).join(" · ") || "주소 미등록"} ·{" "}
            {ANIMAL_TYPE_LABELS[house.animal_type ?? "mixed"]}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/slaughterhouses/${id}/edit`}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            정보 수정
          </Link>
          <form action={startVisit.bind(null, id)}>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              + 새 점검 시작
            </button>
          </form>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">점검 이력</h2>
        {!visits || visits.length === 0 ? (
          <p className="rounded-md border border-dashed border-gray-300 p-6 text-center text-sm text-gray-500">
            아직 점검 이력이 없습니다.
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
            {visits.map((visit) => (
              <li key={visit.id}>
                <Link
                  href={`/visits/${visit.id}`}
                  className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{visit.visit_date}</p>
                    <p className="text-xs text-gray-500">
                      담당자: {(visit.inspector as { name?: string } | null)?.name ?? "-"}
                    </p>
                  </div>
                  <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                    {VISIT_STATUS_LABELS[visit.status] ?? visit.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">참여 담당자</h2>
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {(members ?? []).map((member) => {
            const profile = member.profile as { name?: string; email?: string } | null
            return (
              <li key={member.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{profile?.name}</p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {ROLE_LABELS[member.role] ?? member.role}
                </span>
              </li>
            )
          })}
          {(!members || members.length === 0) && (
            <li className="px-4 py-3 text-sm text-gray-500">등록된 담당자가 없습니다.</li>
          )}
        </ul>

        <form
          action={addTeamMember.bind(null, id)}
          className="flex flex-wrap items-end gap-2 rounded-md border border-gray-200 bg-white p-3"
        >
          <div className="flex-1 min-w-[200px]">
            <label className="mb-1 block text-xs font-medium text-gray-700">
              추가할 담당자 이메일 (기존 가입자만 가능)
            </label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-700">권한</label>
            <select
              name="role"
              defaultValue="editor"
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="owner">owner</option>
              <option value="editor">editor</option>
              <option value="viewer">viewer</option>
            </select>
          </div>
          <button
            type="submit"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            추가
          </button>
        </form>
      </section>
    </div>
  )
}
