/** GitHub username — avatar is loaded from github.com/{username}.png */
export const githubUsername = "felixinbytes";

export const siteName = "Felix in Bytes";

export function githubAvatarUrl(size = 256) {
  return `https://github.com/${githubUsername}.png?size=${size}`;
}

export function githubProfileUrl() {
  return `https://github.com/${githubUsername}`;
}
