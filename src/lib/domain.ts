export const ANIMAL_TYPE_LABELS: Record<string, string> = {
  cattle: "소",
  pig: "돼지",
  mixed: "혼합",
}

export const RISK_CATEGORY_LABELS: Record<string, string> = {
  fall: "추락",
  caught_in: "끼임",
  slip: "미끄러짐",
  cut: "절단",
  chemical_exposure: "화학물질 노출",
  other: "기타",
}

export const SEVERITY_LABELS: Record<string, string> = {
  high: "상",
  medium: "중",
  low: "하",
}

export const SEVERITY_ORDER: Record<string, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

export const RISK_STATUS_LABELS: Record<string, string> = {
  ai_draft: "AI 초안",
  reviewed: "검토중",
  confirmed: "확정",
  dismissed: "반려",
}

export const ACTION_STATUS_LABELS: Record<string, string> = {
  draft: "초안",
  review: "검토",
  confirmed: "확정",
  in_progress: "이행중",
  completed: "완료",
}

export const ACTION_STATUS_ORDER = [
  "draft",
  "review",
  "confirmed",
  "in_progress",
  "completed",
] as const

export const VISIT_STATUS_LABELS: Record<string, string> = {
  in_progress: "진행중",
  photos_done: "사진완료",
  analyzed: "분석완료",
  reviewed: "검토완료",
}

export const ROLE_LABELS: Record<string, string> = {
  admin: "관리자",
  manager: "매니저",
  inspector: "담당자",
  viewer: "열람자",
}

export const MAX_PHOTOS_PER_VISIT = 20
