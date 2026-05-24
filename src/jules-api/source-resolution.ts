export interface GitHubRepositoryCoordinates {
  owner: string;
  repo: string;
}

interface SourceLookupClient {
  listSources(filter?: string): Promise<{
    sources: Array<{ name: string }>;
  }>;
}

export interface ResolveSourceNameInput {
  explicitSourceName?: string;
  fallbackRepository?: GitHubRepositoryCoordinates;
}

export function buildRepositorySourceName(
  repository: GitHubRepositoryCoordinates,
): string {
  return `sources/github/${repository.owner}/${repository.repo}`;
}

function buildSourceFilter(sourceName: string): string {
  return `name=${sourceName}`;
}

export async function resolveSourceName(
  client: SourceLookupClient,
  input: ResolveSourceNameInput,
): Promise<string> {
  const explicitSourceName = input.explicitSourceName?.trim();
  const expectedSourceName =
    explicitSourceName ||
    (input.fallbackRepository
      ? buildRepositorySourceName(input.fallbackRepository)
      : undefined);

  if (!expectedSourceName) {
    throw new Error(
      "Input 'source' is required when GITHUB_REPOSITORY is not available.",
    );
  }

  const response = await client.listSources(
    buildSourceFilter(expectedSourceName),
  );
  const matchingSources = response.sources.filter(
    (source) => source.name === expectedSourceName,
  );

  if (matchingSources.length === 0) {
    throw new Error(
      `No Jules source matched '${expectedSourceName}'. Install the Jules GitHub app for that repository.`,
    );
  }

  if (matchingSources.length > 1) {
    throw new Error(
      `Multiple Jules sources matched '${expectedSourceName}'. Resolve the duplication in Jules before using this action.`,
    );
  }

  return matchingSources[0].name;
}
