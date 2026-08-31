import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { ANIMAL_TYPE_LABELS } from "@/lib/domain"

export default async function SlaughterhousesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from("slaughterhouses")
    .select("id, name, address, region, animal_type, created_at")
    .order("created_at", { ascending: false })

  if (q) {
    query = query.or(`name.ilike.%${q}%,address.ilike.%${q}%,region.ilike.%${q}%`)
  }

  const { data: slaughterhouses } = await query

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-900">도축장</h1>
        <Link
          href="/slaughterhouses/new"
          className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          + 도축장 등록
        </Link>
      </div>

      <form className="flex gap-2">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="도축장명, 주소, 지역으로 검색"
          className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
        >
          검색
        </button>
      </form>

      {!slaughterhouses || slaughterhouses.length === 0 ? (
        <p className="rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          {q ? "검색 결과가 없습니다." : "등록된 도축장이 없습니다. 새로 등록해주세요."}
        </p>
      ) : (
        <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
          {slaughterhouses.map((house) => (
            <li key={house.id}>
              <Link
                href={`/slaughterhouses/${house.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">{house.name}</p>
                  <p className="text-xs text-gray-500">
                    {[house.region, house.address].filter(Boolean).join(" · ") || "주소 미등록"}
                  </p>
                </div>
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600">
                  {ANIMAL_TYPE_LABELS[house.animal_type ?? "mixed"]}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
