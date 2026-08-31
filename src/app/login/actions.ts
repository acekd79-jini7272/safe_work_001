"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const ID_DOMAIN = "@ekape.local"

export async function signIn(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim().toLowerCase()
  const password = String(formData.get("password") ?? "")

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: `${id}${ID_DOMAIN}`,
    password,
  })

  if (error) {
    redirect(
      `/login?error=${encodeURIComponent(`로그인 실패 (${error.status ?? "-"} ${error.code ?? error.name}): ${error.message}`)}`,
    )
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
