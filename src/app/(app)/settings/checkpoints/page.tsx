import { createClient } from "@/lib/supabase/server"
import { requireProfile } from "@/lib/auth"
import { createCheckpointType, toggleCheckpointActive } from "./actions"

export default async function CheckpointSettingsPage() {
  const profile = await requireProfile()
  const supabase = await createClient()
  const { data: checkpointTypes } = await supabase
    .from("checkpoint_types")
    .select("*")
    .order("sort_order")

  const isAdmin = profile.role === "admin"

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-lg font-bold text-gray-900">점검포인트 설정</h1>

      {!isAdmin && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          점검포인트 추가/수정은 관리자 권한이 필요합니다. 현재 계정 권한: {profile.role}
        </p>
      )}

      <ul className="divide-y divide-gray-200 rounded-md border border-gray-200 bg-white">
        {(checkpointTypes ?? []).map((cp) => (
          <li key={cp.id} className="flex items-center justify-between px-4 py-3">
            <div>
              <p className="text-sm font-medium text-gray-900">
                {cp.name} {cp.is_required && <span className="text-xs text-gray-400">(필수)</span>}
              </p>
              {cp.description && <p className="text-xs text-gray-500">{cp.description}</p>}
            </div>
            {isAdmin && (
              <form action={toggleCheckpointActive.bind(null, cp.id, !cp.active)}>
                <button
                  type="submit"
                  className={`rounded-full px-2 py-1 text-xs ${
                    cp.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {cp.active ? "사용중" : "비활성"}
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {isAdmin && (
        <form
          action={createCheckpointType}
          className="space-y-3 rounded-md border border-gray-200 bg-white p-4"
        >
          <h2 className="text-sm font-semibold text-gray-700">점검포인트 추가</h2>
          <input
            name="name"
            required
            placeholder="예: 세척 설비"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            name="description"
            placeholder="설명 (선택)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="is_required" defaultChecked />
            필수 점검포인트
          </label>
          <button
            type="submit"
            className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            추가
          </button>
        </form>
      )}
    </div>
  )
}
