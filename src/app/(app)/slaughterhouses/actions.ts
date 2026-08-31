"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createSlaughterhouse(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim() || null
  const region = String(formData.get("region") ?? "").trim() || null
  const animal_type = String(formData.get("animal_type") ?? "mixed")
  const contact_name = String(formData.get("contact_name") ?? "").trim() || null
  const contact_phone = String(formData.get("contact_phone") ?? "").trim() || null

  if (!name) {
    redirect(`/slaughterhouses/new?error=${encodeURIComponent("도축장명을 입력해주세요.")}`)
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("slaughterhouses")
    .insert({
      name,
      address,
      region,
      animal_type,
      contact_name,
      contact_phone,
      created_by: user.id,
    })
    .select("id")
    .single()

  if (error || !data) {
    redirect(`/slaughterhouses/new?error=${encodeURIComponent(error?.message ?? "등록에 실패했습니다.")}`)
  }

  revalidatePath("/slaughterhouses")
  redirect(`/slaughterhouses/${data.id}`)
}

export async function updateSlaughterhouse(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const address = String(formData.get("address") ?? "").trim() || null
  const region = String(formData.get("region") ?? "").trim() || null
  const animal_type = String(formData.get("animal_type") ?? "mixed")
  const contact_name = String(formData.get("contact_name") ?? "").trim() || null
  const contact_phone = String(formData.get("contact_phone") ?? "").trim() || null

  const supabase = await createClient()
  await supabase
    .from("slaughterhouses")
    .update({ name, address, region, animal_type, contact_name, contact_phone })
    .eq("id", id)

  revalidatePath(`/slaughterhouses/${id}`)
  redirect(`/slaughterhouses/${id}`)
}

export async function addTeamMember(slaughterhouseId: string, formData: FormData) {
  const email = String(formData.get("email") ?? "").trim()
  const role = String(formData.get("role") ?? "editor")

  const supabase = await createClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single()

  if (!profile) {
    redirect(
      `/slaughterhouses/${slaughterhouseId}?error=${encodeURIComponent(
        "해당 이메일로 가입된 사용자를 찾을 수 없습니다.",
      )}`,
    )
  }

  await supabase.from("slaughterhouse_members").insert({
    slaughterhouse_id: slaughterhouseId,
    user_id: profile.id,
    role,
  })

  revalidatePath(`/slaughterhouses/${slaughterhouseId}`)
  redirect(`/slaughterhouses/${slaughterhouseId}`)
}
