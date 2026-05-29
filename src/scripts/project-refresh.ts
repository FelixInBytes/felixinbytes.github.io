import {
  buildGitHubApiUrl,
  parseGitHubRepo,
  sanitizeGitHubRepoResponse,
  type GitHubRepoData,
} from "../lib/github-validation";

const REFRESH_COOLDOWN_MS = 5000;
const lastRefreshBySlug = new Map<string, number>();

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function setRowVisible(row: HTMLElement | null, visible: boolean) {
  if (!row) return;
  row.classList.toggle("is-hidden", !visible);
}

function setSafeLink(cell: HTMLElement, href: string, label: string) {
  cell.replaceChildren();

  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  link.rel = "noopener noreferrer";
  cell.appendChild(link);
}

function setText(meta: HTMLElement, field: string, value: string | null | undefined) {
  const row = meta.querySelector(`[data-meta-row="${field}"]`);
  const cell = meta.querySelector(`[data-meta-value="${field}"]`);
  if (!(row instanceof HTMLElement) || !(cell instanceof HTMLElement)) return;

  if (!value) {
    cell.replaceChildren();
    setRowVisible(row, false);
    return;
  }

  cell.textContent = value;
  setRowVisible(row, true);
}

function applyRepoMeta(meta: HTMLElement, repo: GitHubRepoData) {
  const repositoryRow = meta.querySelector('[data-meta-row="repository"]');
  const repositoryCell = meta.querySelector('[data-meta-value="repository"]');

  if (
    repositoryRow instanceof HTMLElement &&
    repositoryCell instanceof HTMLElement
  ) {
    setSafeLink(repositoryCell, repo.html_url, repo.full_name);
    setRowVisible(repositoryRow, true);
  }

  setText(meta, "about", repo.description);
  setText(meta, "language", repo.language);
  setText(meta, "stars", repo.stargazers_count.toLocaleString());
  setText(meta, "forks", repo.forks_count.toLocaleString());
  setText(meta, "pushed", formatDate(repo.pushed_at));

  const siteRow = meta.querySelector('[data-meta-row="site"]');
  const siteCell = meta.querySelector('[data-meta-value="site"]');

  if (siteRow instanceof HTMLElement && siteCell instanceof HTMLElement) {
    if (repo.homepage) {
      setSafeLink(siteCell, repo.homepage, repo.homepage);
      setRowVisible(siteRow, true);
    } else {
      siteCell.replaceChildren();
      setRowVisible(siteRow, false);
    }
  }

  const statusRow = meta.querySelector('[data-meta-row="status"]');
  const statusCell = meta.querySelector('[data-meta-value="status"]');

  if (statusRow instanceof HTMLElement && statusCell instanceof HTMLElement) {
    if (repo.archived) {
      statusCell.textContent = "Archived";
      setRowVisible(statusRow, true);
    } else {
      statusCell.textContent = "";
      setRowVisible(statusRow, false);
    }
  }
}

function flashStatus(box: HTMLElement, message: string, type: "success" | "error") {
  const status = box.querySelector("[data-refresh-status]");
  if (!(status instanceof HTMLElement)) return;

  status.textContent = message;
  status.dataset.state = type;
  status.classList.add("is-visible");

  window.setTimeout(() => {
    status.classList.remove("is-visible");
  }, 2500);
}

function resolveSlug(
  buttonSlug: string | undefined,
  metaSlug: string | undefined,
): string | null {
  const fromButton = buttonSlug ? parseGitHubRepo(buttonSlug) : null;
  const fromMeta = metaSlug ? parseGitHubRepo(metaSlug) : null;

  if (!fromButton || !fromMeta || fromButton !== fromMeta) {
    return null;
  }

  return fromButton;
}

function isCoolingDown(slug: string): boolean {
  const lastRefresh = lastRefreshBySlug.get(slug);
  if (!lastRefresh) return false;

  return Date.now() - lastRefresh < REFRESH_COOLDOWN_MS;
}

async function refreshRepo(button: HTMLButtonElement) {
  const box = button.closest(".project-box");
  const meta = box?.querySelector("[data-repo-meta]");

  if (!(box instanceof HTMLElement) || !(meta instanceof HTMLElement)) {
    return;
  }

  const slug = resolveSlug(
    button.dataset.refreshRepo,
    meta.dataset.slug,
  );

  if (!slug) {
    flashStatus(box, "Invalid repository reference", "error");
    return;
  }

  if (isCoolingDown(slug)) {
    flashStatus(box, "Please wait before refreshing again", "error");
    return;
  }

  const apiUrl = buildGitHubApiUrl(slug);
  if (!apiUrl) {
    flashStatus(box, "Invalid repository reference", "error");
    return;
  }

  button.disabled = true;
  button.setAttribute("aria-busy", "true");
  lastRefreshBySlug.set(slug, Date.now());

  try {
    const response = await fetch(apiUrl, {
      headers: { Accept: "application/vnd.github+json" },
    });

    if (!response.ok) {
      throw new Error(`GitHub API ${response.status}`);
    }

    const repo = sanitizeGitHubRepoResponse(await response.json(), slug);
    if (!repo) {
      throw new Error("Invalid GitHub API response");
    }

    applyRepoMeta(meta, repo);
    flashStatus(box, "Repository data updated", "success");
  } catch {
    flashStatus(box, "Could not fetch repository data", "error");
  } finally {
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}

export function initProjectRefresh() {
  document.querySelectorAll("[data-refresh-repo]").forEach((button) => {
    if (!(button instanceof HTMLButtonElement)) return;
    button.addEventListener("click", () => refreshRepo(button));
  });
}

initProjectRefresh();
