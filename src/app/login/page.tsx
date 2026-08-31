import { signIn } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">
            도축장 산업안전 위험관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            도축장 아이디로 로그인해주세요 (예: ekape_0001)
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}

        <form action={signIn} className="space-y-4">
          <input
            name="id"
            type="text"
            required
            autoComplete="username"
            placeholder="도축장 아이디 (예: ekape_0001)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            placeholder="비밀번호"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
          >
            로그인
          </button>
        </form>
      </div>
    </div>
  )
}
