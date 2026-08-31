"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { analyzePhoto } from "@/lib/ai/analyze"

function guessMimeType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase()
  if (ext === "png") return "image/png"
  if (ext === "webp") return "image/webp"
  if (ext === "gif") return "image/gif"
  return "image/jpeg"
}

export async function runAnalysis(visitId: string) {
  const supabase = await createClient()

  const { data: photos } = await supabase
    .from("photos")
    .select("id, file_path, checkpoint_type:checkpoint_types(name)")
    .eq("visit_id", visitId)
    .eq("ai_status", "pending")

  for (const photo of photos ?? []) {
    await supabase.from("photos").update({ ai_status: "analyzing" }).eq("id", photo.id)

    try {
      const { data: blob, error: downloadError } = await supabase.storage
        .from("visit-photos")
        .download(photo.file_path)

      if (downloadError || !blob) {
        throw downloadError ?? new Error("파일을 다운로드하지 못했습니다.")
      }

      const arrayBuffer = await blob.arrayBuffer()
      const base64 = Buffer.from(arrayBuffer).toString("base64")
      const checkpoint = photo.checkpoint_type as { name?: string } | null

      const { findings, raw } = await analyzePhoto({
        imageBase64: base64,
        mimeType: guessMimeType(photo.file_path),
        checkpointName: checkpoint?.name ?? null,
      })

      if (findings.length > 0) {
        await supabase.from("risk_findings").insert(
          findings.map((f) => ({
            photo_id: photo.id,
            visit_id: visitId,
            category: f.category,
            severity: f.severity,
            description: f.description,
            regulation_ref: f.regulation_ref,
            ai_generated: true,
            ai_raw_response: raw as never,
          })),
        )
      }

      await supabase.from("photos").update({ ai_status: "done" }).eq("id", photo.id)
    } catch {
      await supabase.from("photos").update({ ai_status: "failed" }).eq("id", photo.id)
    }
  }

  await supabase.from("visits").update({ status: "analyzed" }).eq("id", visitId)
  redirect(`/visits/${visitId}/review`)
}
