import {
  buildGitHubApiUrl,
  parseGitHubRepo,
  sanitizeGitHubRepoResponse,
  type GitHubRepoData,
} from "./github-validation";

export type GitHubRepo = GitHubRepoData;

export { parseGitHubRepo };

export async function fetchGitHubRepo(
  input: string,
): Promise<GitHubRepo | null> {
  const slug = parseGitHubRepo(input);
  if (!slug) {
    return null;
  }

  const apiUrl = buildGitHubApiUrl(slug);
  if (!apiUrl) {
    return null;
  }

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "felixinbytes-blog",
  };

  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(apiUrl, { headers });

  if (!response.ok) {
    console.warn(`GitHub API error for ${slug}: ${response.status}`);
    return null;
  }

  return sanitizeGitHubRepoResponse(await response.json(), slug);
}

export async function enrichProject<T extends { data: { github: string } }>(
  project: T,
) {
  const slug = parseGitHubRepo(project.data.github);
  const repo = slug ? await fetchGitHubRepo(project.data.github) : null;

  return {
    project,
    repo,
    slug: slug ?? "",
  };
}
