import { ApiError, type Source, type SourceName, sourceName } from 'jls';
import type { GitHubRepositoryCoordinates } from '../workflow-context/github-repository-context';

export interface SourceLookupClient {
  getSource(name: SourceName): Promise<Source>;
}

export interface ResolveSourceNameInput {
  explicitSourceName?: SourceName;
  fallbackRepository?: GitHubRepositoryCoordinates;
}

export function buildRepositorySourceName(
  repository: GitHubRepositoryCoordinates,
): SourceName {
  return sourceName(`sources/github/${repository.owner}/${repository.repo}`);
}

export async function resolveSourceName(
  client: SourceLookupClient,
  input: ResolveSourceNameInput,
): Promise<SourceName> {
  const expectedSourceName =
    input.explicitSourceName ??
    (input.fallbackRepository
      ? buildRepositorySourceName(input.fallbackRepository)
      : undefined);

  if (expectedSourceName === undefined) {
    throw new Error(
      "Input 'source' is required when GITHUB_REPOSITORY is not available.",
    );
  }

  try {
    const source = await client.getSource(expectedSourceName);
    return source.name;
  } catch (error) {
    if (error instanceof ApiError && error.code === 404) {
      throw new Error(
        `No Jules source matched '${expectedSourceName}'. Install the Jules GitHub app for that repository.`,
      );
    }
    throw error;
  }
}
