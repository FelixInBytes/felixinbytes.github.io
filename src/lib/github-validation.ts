export const GITHUB_SLUG_PATTERN = /^[\w.-]+\/[\w.-]+$/;

export interface GitHubRepoData {
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  archived: boolean;
}

export function parseGitHubRepo(input: string): string | null {
  const trimmed = input.trim().replace(/\/$/, "");
  const urlMatch = trimmed.match(/github\.com\/([^/?#]+\/[^/?#]+)/i);

  if (urlMatch) {
    const slug = urlMatch[1]!.replace(/\.git$/, "");
    return GITHUB_SLUG_PATTERN.test(slug) ? slug : null;
  }

  return GITHUB_SLUG_PATTERN.test(trimmed) ? trimmed : null;
}

export function buildGitHubApiUrl(slug: string): string | null {
  const parsed = parseGitHubRepo(slug);
  if (!parsed) return null;

  const [owner, repo] = parsed.split("/");
  return `https://api.github.com/repos/${encodeURIComponent(owner!)}/${encodeURIComponent(repo!)}`;
}

function stripControlCharacters(value: string): string {
  return value.replace(/[\u0000-\u001F\u007F]/g, "").trim();
}

export function sanitizeText(
  value: unknown,
  maxLength = 500,
): string | null {
  if (typeof value !== "string") return null;

  const cleaned = stripControlCharacters(value);
  if (!cleaned) return null;

  if (cleaned.length <= maxLength) return cleaned;
  return `${cleaned.slice(0, maxLength)}…`;
}

export function sanitizeCount(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return null;
  }

  return Math.floor(value);
}

export function isGitHubRepoUrl(url: string, expectedSlug: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "github.com") {
      return false;
    }

    const match = parsed.pathname.match(/^\/([^/]+\/[^/]+)\/?$/);
    return match?.[1]?.toLowerCase() === expectedSlug.toLowerCase();
  } catch {
    return false;
  }
}

export function isSafeHomepageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.includes(".");
  } catch {
    return false;
  }
}

function sanitizeIsoDate(value: unknown): string | null {
  if (typeof value !== "string") return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return value;
}

export function sanitizeGitHubRepoResponse(
  data: unknown,
  expectedSlug: string,
): GitHubRepoData | null {
  if (!data || typeof data !== "object") return null;

  const raw = data as Record<string, unknown>;
  const fullName = sanitizeText(raw.full_name, 200);

  if (!fullName || fullName.toLowerCase() !== expectedSlug.toLowerCase()) {
    return null;
  }

  const htmlUrl = typeof raw.html_url === "string" ? raw.html_url : "";
  if (!isGitHubRepoUrl(htmlUrl, expectedSlug)) return null;

  const stars = sanitizeCount(raw.stargazers_count);
  const forks = sanitizeCount(raw.forks_count);
  const pushedAt = sanitizeIsoDate(raw.pushed_at);

  if (stars === null || forks === null || !pushedAt) return null;

  const homepage =
    typeof raw.homepage === "string" && raw.homepage.trim()
      ? isSafeHomepageUrl(raw.homepage)
        ? raw.homepage
        : null
      : null;

  return {
    full_name: fullName,
    description: sanitizeText(raw.description, 1000),
    html_url: htmlUrl,
    homepage,
    language: sanitizeText(raw.language, 80),
    stargazers_count: stars,
    forks_count: forks,
    pushed_at: pushedAt,
    archived: raw.archived === true,
  };
}
