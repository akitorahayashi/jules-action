export interface GitHubRepositoryCoordinates {
  owner: string;
  repo: string;
}

function readRequiredEnvironmentVariable(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Environment variable '${name}' is required.`);
  }
  return value;
}

export function resolveGitHubRepositoryCoordinates(): GitHubRepositoryCoordinates {
  const repository = readRequiredEnvironmentVariable('GITHUB_REPOSITORY');
  const [owner, repo, ...rest] = repository.split('/');

  if (!owner || !repo || rest.length > 0) {
    throw new Error(
      "Environment variable 'GITHUB_REPOSITORY' must be in the form 'owner/repo'.",
    );
  }

  return { owner, repo };
}

export function resolveGitHubBranchName(): string {
  const headRef = process.env.GITHUB_HEAD_REF?.trim();
  if (headRef) {
    return headRef;
  }

  const refType = process.env.GITHUB_REF_TYPE?.trim();
  const refName = process.env.GITHUB_REF_NAME?.trim();
  if (refType === 'branch' && refName) {
    return refName;
  }

  throw new Error(
    "Unable to resolve the workflow branch. Set input 'starting-branch' or run on a branch ref.",
  );
}
