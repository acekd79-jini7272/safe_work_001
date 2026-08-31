import Anthropic from "@anthropic-ai/sdk"

export type RiskFindingDraft = {
  category: "fall" | "caught_in" | "slip" | "cut" | "chemical_exposure" | "other"
  severity: "high" | "medium" | "low"
  description: string
  regulation_ref: string | null
}

const VALID_CATEGORIES = new Set([
  "fall",
  "caught_in",
  "slip",
  "cut",
  "chemical_exposure",
  "other",
])
const VALID_SEVERITIES = new Set(["high", "medium", "low"])

const SYSTEM_PROMPT = `당신은 대한민국 축산물 도축장 산업안전보건 전문가입니다.
등급판정사가 도축장 현장에서 촬영한 사진을 분석하여 산업안전보건 위험요인을 식별합니다.
가능한 위험요인 카테고리: fall(추락), caught_in(끼임), slip(미끄러짐), cut(절단), chemical_exposure(화학물질 노출), other(기타).
관련 법령은 산업안전보건법 또는 KOSHA GUIDE 조항을 최대한 구체적으로 인용하세요. 확실하지 않으면 null로 두세요.
사진에서 명확한 위험요인이 보이지 않으면 빈 배열을 반환하세요. 과장하거나 추측하지 마세요.

반드시 아래 JSON 스키마의 배열만 반환하세요. 다른 텍스트는 포함하지 마세요:
[{"category": "fall|caught_in|slip|cut|chemical_exposure|other", "severity": "high|medium|low", "description": "위험요인과 1차 대응방안(안전조치) 설명 (한국어)", "regulation_ref": "관련 법령/기준 또는 null"}]`

function mockFindings(checkpointName: string | null): RiskFindingDraft[] {
  return [
    {
      category: "other",
      severity: "low",
      description: `(Mock 분석) ${checkpointName ?? "이동동선"} 사진에 대한 예시 결과입니다. 실제 AI 분석을 사용하려면 ANTHROPIC_API_KEY 환경변수를 설정해주세요. 설정 후에는 Claude vision이 사진을 분석해 실제 위험요인과 1차 대응방안 초안을 생성합니다.`,
      regulation_ref: null,
    },
  ]
}

export async function analyzePhoto(params: {
  imageBase64: string
  mimeType: string
  checkpointName: string | null
}): Promise<{ findings: RiskFindingDraft[]; raw: unknown }> {
  const apiKey = process.env.ANTHROPIC_API_KEY

  if (!apiKey) {
    const findings = mockFindings(params.checkpointName)
    return { findings, raw: { mock: true } }
  }

  const client = new Anthropic({ apiKey })

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: params.mimeType as
                | "image/jpeg"
                | "image/png"
                | "image/gif"
                | "image/webp",
              data: params.imageBase64,
            },
          },
          {
            type: "text",
            text: `점검포인트: ${params.checkpointName ?? "이동동선(미지정)"}\n위 사진을 분석해 위험요인을 JSON 배열로만 반환하세요.`,
          },
        ],
      },
    ],
  })

  const textBlock = message.content.find((block) => block.type === "text")
  const raw = textBlock && "text" in textBlock ? textBlock.text : ""

  let parsed: unknown
  try {
    const jsonMatch = raw.match(/\[[\s\S]*\]/)
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
  } catch {
    return { findings: [], raw }
  }

  if (!Array.isArray(parsed)) {
    return { findings: [], raw }
  }

  const findings: RiskFindingDraft[] = parsed
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      category: VALID_CATEGORIES.has(String(item.category))
        ? (item.category as RiskFindingDraft["category"])
        : "other",
      severity: VALID_SEVERITIES.has(String(item.severity))
        ? (item.severity as RiskFindingDraft["severity"])
        : "medium",
      description: String(item.description ?? "").slice(0, 2000),
      regulation_ref: item.regulation_ref ? String(item.regulation_ref).slice(0, 500) : null,
    }))
    .filter((f) => f.description.length > 0)

  return { findings, raw }
}
