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
    redirect(`/login?error=${encodeURIComponent("아이디 또는 비밀번호가 올바르지 않습니다.")}`)
  }

  redirect("/dashboard")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}
