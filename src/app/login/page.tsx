import { signIn, signUp } from "./actions"

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; notice?: string }>
}) {
  const { error, notice } = await searchParams

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">
            도축장 산업안전 위험관리
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            축산물품질평가사 내부 시스템 로그인
          </p>
        </div>

        {error && (
          <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        {notice && (
          <p className="rounded-md bg-blue-50 px-3 py-2 text-sm text-blue-700">
            {notice}
          </p>
        )}

        <form action={signIn} className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">로그인</h2>
          <input
            name="email"
            type="email"
            required
            placeholder="이메일"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            name="password"
            type="password"
            required
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

        <div className="border-t border-gray-200 pt-6">
          <form action={signUp} className="space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">
              처음이신가요? 계정 만들기
            </h2>
            <input
              name="name"
              type="text"
              required
              placeholder="이름"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="email"
              type="email"
              required
              placeholder="이메일"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <input
              name="password"
              type="password"
              required
              minLength={6}
              placeholder="비밀번호 (6자 이상)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
            />
            <button
              type="submit"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              계정 만들기
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
