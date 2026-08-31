import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ANIMAL_TYPE_LABELS } from "@/lib/domain"
import { updateSlaughterhouse } from "../../actions"

export default async function EditSlaughterhousePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const { data: house } = await supabase.from("slaughterhouses").select("*").eq("id", id).single()

  if (!house) {
    notFound()
  }

  const action = updateSlaughterhouse.bind(null, id)

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-bold text-gray-900">도축장 정보 수정</h1>
      <form action={action} className="space-y-4">
        <Field label="도축장명" name="name" defaultValue={house.name} required />
        <Field label="지역" name="region" defaultValue={house.region ?? ""} />
        <Field label="주소" name="address" defaultValue={house.address ?? ""} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">가축 종류</label>
          <select
            name="animal_type"
            defaultValue={house.animal_type ?? "mixed"}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {Object.entries(ANIMAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Field label="담당자명" name="contact_name" defaultValue={house.contact_name ?? ""} />
        <Field label="담당자 연락처" name="contact_phone" defaultValue={house.contact_phone ?? ""} />
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          저장
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  required,
  defaultValue,
}: {
  label: string
  name: string
  required?: boolean
  defaultValue?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        required={required}
        defaultValue={defaultValue}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  )
}
