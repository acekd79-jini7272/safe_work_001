import { createSlaughterhouse } from "../actions"
import { ANIMAL_TYPE_LABELS } from "@/lib/domain"

export default async function NewSlaughterhousePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-lg font-bold text-gray-900">도축장 등록</h1>

      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      )}

      <form action={createSlaughterhouse} className="space-y-4">
        <Field label="도축장명" name="name" required />
        <Field label="지역" name="region" placeholder="예: 경기 안성" />
        <Field label="주소" name="address" />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">가축 종류</label>
          <select
            name="animal_type"
            defaultValue="mixed"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {Object.entries(ANIMAL_TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <Field label="담당자명" name="contact_name" />
        <Field label="담당자 연락처" name="contact_phone" />
        <button
          type="submit"
          className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          등록
        </button>
      </form>
    </div>
  )
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string
  name: string
  required?: boolean
  placeholder?: string
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">{label}</label>
      <input
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
    </div>
  )
}
