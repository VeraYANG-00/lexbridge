import { NextRequest } from "next/server";

const COURT_LISTENER_SEARCH_URL = "https://www.courtlistener.com/api/rest/v4/search/";
const PAGE_SIZE = 20;
const CACHE_TTL_MS = 10 * 60 * 1000;
const CACHE_MAX_ENTRIES = 50;

export const dynamic = "force-dynamic";

type CaseResult = {
  caseName: string;
  court: string;
  dateFiled: string;
  snippet: string;
  link: string;
};

type CasesPayload = {
  count: number;
  results: CaseResult[];
};

const cache = new Map<string, { at: number; data: CasesPayload }>();

function getCached(key: string): CasesPayload | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCached(key: string, data: CasesPayload): void {
  if (cache.size >= CACHE_MAX_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), data });
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function extractCourt(item: Record<string, unknown>): string {
  const court = item.court;
  if (typeof court === "string") return court;
  if (court && typeof court === "object") {
    const record = court as Record<string, unknown>;
    const value = record.name ?? record.db ?? record.court ?? "";
    return typeof value === "string" ? value : "";
  }
  return "";
}

function extractSnippet(item: Record<string, unknown>): string {
  const highlights = item.highlights;
  if (highlights && typeof highlights === "object") {
    const record = highlights as Record<string, unknown>;
    for (const key of ["text", "caseName", "description"]) {
      const parts = record[key];
      if (Array.isArray(parts) && typeof parts[0] === "string" && parts[0]) {
        return stripHtml(parts[0]).slice(0, 220);
      }
    }
  }

  const syllabus = item.syllabus;
  if (typeof syllabus === "string" && syllabus.trim()) {
    return stripHtml(syllabus).slice(0, 220);
  }

  const opinions = item.opinions;
  if (Array.isArray(opinions)) {
    for (const opinion of opinions) {
      if (!opinion || typeof opinion !== "object") continue;
      const record = opinion as Record<string, unknown>;
      if (typeof record.snippet === "string" && record.snippet.trim()) {
        return stripHtml(record.snippet).slice(0, 220);
      }
    }
  }

  return "";
}

function mapResult(item: Record<string, unknown>): CaseResult {
  const absoluteUrl = typeof item.absolute_url === "string" ? item.absolute_url : "";
  return {
    caseName: typeof item.caseName === "string" ? item.caseName : "",
    court: extractCourt(item),
    dateFiled: typeof item.dateFiled === "string" ? item.dateFiled : "",
    snippet: extractSnippet(item),
    link: absoluteUrl ? `https://www.courtlistener.com${absoluteUrl}` : "",
  };
}

function isYear(value: string): boolean {
  return /^\d{4}$/.test(value);
}

function yearToDate(year: string, end: boolean): string {
  return end ? `${year}-12-31` : `${year}-01-01`;
}

async function fetchCases(query: Record<string, string>): Promise<CasesPayload> {
  const key = JSON.stringify(query);
  const cached = getCached(key);
  if (cached) return cached;

  const token = process.env.COURTLISTENER_API_TOKEN;
  const upstream = new URL(COURT_LISTENER_SEARCH_URL);
  for (const [param, value] of Object.entries(query)) {
    upstream.searchParams.set(param, value);
  }

  let response: Response;
  try {
    response = await fetch(upstream, {
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Token ${token}` } : {}),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new Error("无法连接 CourtListener，请稍后再试");
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("CourtListener 鉴权失败，请检查服务端环境变量 COURTLISTENER_API_TOKEN");
    }
    if (response.status === 429) {
      throw new Error("CourtListener 请求过于频繁，请稍后再试");
    }
    throw new Error(`CourtListener 返回错误（HTTP ${response.status}）`);
  }

  const body = (await response.json()) as {
    count?: number;
    results?: unknown[];
  };

  const payload: CasesPayload = {
    count: typeof body.count === "number" ? body.count : 0,
    results: Array.isArray(body.results)
      ? body.results
          .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
          .map(mapResult)
      : [],
  };

  setCached(key, payload);
  return payload;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const q = (params.get("q") ?? "").trim();
  const court = (params.get("court") ?? "").trim();
  const filedAfter = (params.get("filed_after") ?? "").trim();
  const filedBefore = (params.get("filed_before") ?? "").trim();

  if (!q) {
    return Response.json({ error: "缺少搜索关键词 q" }, { status: 400 });
  }
  if (filedAfter && !isYear(filedAfter)) {
    return Response.json({ error: "filed_after 必须是四位年份" }, { status: 400 });
  }
  if (filedBefore && !isYear(filedBefore)) {
    return Response.json({ error: "filed_before 必须是四位年份" }, { status: 400 });
  }

  const query: Record<string, string> = {
    q,
    type: "o",
    page_size: String(PAGE_SIZE),
  };
  if (court) query.court = court;
  if (filedAfter) query.filed_after = yearToDate(filedAfter, false);
  if (filedBefore) query.filed_before = yearToDate(filedBefore, true);

  try {
    const payload = await fetchCases(query);
    return Response.json(payload);
  } catch (error) {
    const message = error instanceof Error ? error.message : "未知错误";
    return Response.json({ error: message }, { status: 502 });
  }
}