"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function createCheckpointType(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim()
  const description = String(formData.get("description") ?? "").trim() || null
  const is_required = formData.get("is_required") === "on"

  if (!name) return

  const supabase = await createClient()
  const { count } = await supabase
    .from("checkpoint_types")
    .select("*", { count: "exact", head: true })

  await supabase.from("checkpoint_types").insert({
    name,
    description,
    is_required,
    sort_order: ((count ?? 0) + 1) * 10,
  })

  revalidatePath("/settings/checkpoints")
}

export async function toggleCheckpointActive(id: string, active: boolean) {
  const supabase = await createClient()
  await supabase.from("checkpoint_types").update({ active }).eq("id", id)
  revalidatePath("/settings/checkpoints")
}
