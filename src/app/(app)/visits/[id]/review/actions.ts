"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export async function updateFinding(visitId: string, findingId: string, formData: FormData) {
  const supabase = await createClient()

  const category = String(formData.get("category") ?? "other")
  const severity = String(formData.get("severity") ?? "medium")
  const description = String(formData.get("description") ?? "").trim()
  const regulation_ref = String(formData.get("regulation_ref") ?? "").trim() || null

  await supabase
    .from("risk_findings")
    .update({ category, severity, description, regulation_ref, status: "reviewed" })
    .eq("id", findingId)

  revalidatePath(`/visits/${visitId}/review`)
}

export async function confirmFinding(visitId: string, findingId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const action_description = String(formData.get("action_description") ?? "").trim()
  const assignee_id = String(formData.get("assignee_id") ?? "") || null
  const due_date = String(formData.get("due_date") ?? "") || null

  await supabase.from("risk_findings").update({ status: "confirmed" }).eq("id", findingId)

  await supabase.from("action_items").insert({
    risk_finding_id: findingId,
    action_description: action_description || "조치 내용을 입력해주세요.",
    assignee_id,
    due_date,
    created_by: user.id,
  })

  revalidatePath(`/visits/${visitId}/review`)
  revalidatePath("/actions")
}

export async function dismissFinding(visitId: string, findingId: string) {
  const supabase = await createClient()
  await supabase.from("risk_findings").update({ status: "dismissed" }).eq("id", findingId)
  revalidatePath(`/visits/${visitId}/review`)
}

export async function finishReview(visitId: string) {
  const supabase = await createClient()
  const { data: visit } = await supabase
    .from("visits")
    .update({ status: "reviewed" })
    .eq("id", visitId)
    .select("slaughterhouse_id")
    .single()

  redirect(visit ? `/slaughterhouses/${visit.slaughterhouse_id}` : "/slaughterhouses")
}
