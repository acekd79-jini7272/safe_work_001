import Link from "next/link"
import { requireProfile } from "@/lib/auth"
import { signOut } from "@/app/login/actions"
import { ROLE_LABELS } from "@/lib/domain"

const NAV_ITEMS = [
  { href: "/dashboard", label: "대시보드" },
  { href: "/slaughterhouses", label: "도축장" },
  { href: "/risks", label: "위험요인" },
  { href: "/actions", label: "조치" },
  { href: "/settings/checkpoints", label: "설정" },
]

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await requireProfile()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="text-sm font-bold text-gray-900">
              도축장 산업안전 위험관리
            </span>
            <nav className="flex gap-4">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {profile.name} · {ROLE_LABELS[profile.role] ?? profile.role}
            </span>
            <form action={signOut}>
              <button
                type="submit"
                className="text-sm text-gray-500 hover:text-gray-900"
              >
                로그아웃
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  )
}
