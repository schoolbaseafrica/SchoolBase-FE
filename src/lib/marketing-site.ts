import type { MarketingSiteConfig } from "@/data/school-profile"

type MarketingSiteResponse = {
  status_code?: number
  message?: string
  data?: {
    marketing_site_config?: MarketingSiteConfig
  }
  marketing_site_config?: MarketingSiteConfig
}

const PROXY_PATH = "/api/proxy-auth/school/marketing-site"

export async function saveMarketingSiteConfig(
  config: MarketingSiteConfig
): Promise<MarketingSiteConfig> {
  const response = await fetch(PROXY_PATH, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ marketing_site_config: config }),
  })
  const text = await response.text()
  let result: MarketingSiteResponse = {}

  try {
    result = text ? (JSON.parse(text) as MarketingSiteResponse) : {}
  } catch {
    throw new Error(response.ok ? "The server returned an invalid response." : text)
  }

  if (!response.ok) {
    throw new Error(result.message || "Could not save the multi-page website.")
  }

  return result.data?.marketing_site_config || result.marketing_site_config || config
}
