"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { MAX_PHOTOS_PER_VISIT } from "@/lib/domain"

export async function startVisit(slaughterhouseId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data, error } = await supabase
    .from("visits")
    .insert({ slaughterhouse_id: slaughterhouseId, inspector_id: user.id })
    .select("id")
    .single()

  if (error || !data) {
    redirect(
      `/slaughterhouses/${slaughterhouseId}?error=${encodeURIComponent(
        error?.message ?? "점검을 시작하지 못했습니다.",
      )}`,
    )
  }

  redirect(`/visits/${data.id}`)
}

export async function addPhoto(visitId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const file = formData.get("photo") as File | null
  const checkpointTypeId = String(formData.get("checkpoint_type_id") ?? "") || null

  if (!file || file.size === 0) {
    redirect(`/visits/${visitId}?error=${encodeURIComponent("사진 파일을 선택해주세요.")}`)
  }

  const { count } = await supabase
    .from("photos")
    .select("*", { count: "exact", head: true })
    .eq("visit_id", visitId)

  if ((count ?? 0) >= MAX_PHOTOS_PER_VISIT) {
    redirect(
      `/visits/${visitId}?error=${encodeURIComponent(`사진은 최대 ${MAX_PHOTOS_PER_VISIT}장까지 업로드할 수 있습니다.`)}`,
    )
  }

  const sequenceNo = (count ?? 0) + 1
  const ext = file.name.split(".").pop() || "jpg"
  const path = `${visitId}/${sequenceNo}-${Date.now()}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from("visit-photos")
    .upload(path, file, { contentType: file.type || "image/jpeg" })

  if (uploadError) {
    redirect(`/visits/${visitId}?error=${encodeURIComponent(uploadError.message)}`)
  }

  const { error: insertError } = await supabase.from("photos").insert({
    visit_id: visitId,
    checkpoint_type_id: checkpointTypeId,
    sequence_no: sequenceNo,
    file_path: path,
    uploaded_by: user.id,
  })

  if (insertError) {
    await supabase.storage.from("visit-photos").remove([path])
    redirect(`/visits/${visitId}?error=${encodeURIComponent(insertError.message)}`)
  }

  revalidatePath(`/visits/${visitId}`)
}

export async function deletePhoto(visitId: string, photoId: string, filePath: string) {
  const supabase = await createClient()
  await supabase.storage.from("visit-photos").remove([filePath])
  await supabase.from("photos").delete().eq("id", photoId)
  revalidatePath(`/visits/${visitId}`)
}

export async function markPhotosDone(visitId: string) {
  const supabase = await createClient()
  await supabase.from("visits").update({ status: "photos_done" }).eq("id", visitId)
  redirect(`/visits/${visitId}/analyze`)
}
