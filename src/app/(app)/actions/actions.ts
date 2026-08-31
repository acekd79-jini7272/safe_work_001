"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateActionStatus(actionId: string, status: string) {
  const supabase = await createClient()
  await supabase.from("action_items").update({ status }).eq("id", actionId)
  revalidatePath("/actions")
  revalidatePath(`/actions/${actionId}`)
}

export async function updateActionAssignment(actionId: string, formData: FormData) {
  const supabase = await createClient()

  const assignee_id = String(formData.get("assignee_id") ?? "") || null
  const due_date = String(formData.get("due_date") ?? "") || null
  const action_description = String(formData.get("action_description") ?? "").trim()

  await supabase
    .from("action_items")
    .update({ assignee_id, due_date, action_description })
    .eq("id", actionId)

  revalidatePath("/actions")
  revalidatePath(`/actions/${actionId}`)
}
