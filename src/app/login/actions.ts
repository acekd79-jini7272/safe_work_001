"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const ID_DOMAIN = "@ekape.local"

export async function signIn(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")
  const email = `${id}${ID_DOMAIN}`

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    const debug = `email="${email}" pwLen=${password.length} url=${process.env.NEXT_PUBLIC_SUPABASE_URL} keyPrefix=${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.slice(0, 12)}`
    redirect(
      `/login?error=${encodeURIComponent(`로그인 실패 (${error.status ?? "-"} ${error.code ?? error.name}): ${error.message} | ${debug}`)}`,
    )
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
