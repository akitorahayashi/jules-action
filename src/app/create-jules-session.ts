import type { CreateSessionActionRequest } from '../action/create-session-request';
import { JulesApiClient } from '../jules-api/client';
import { buildCreateSessionPayload } from '../jules-api/create-session-payload';
import type { Session } from '../jules-api/session-contract';
import { resolveSourceName } from '../jules-api/source-resolution';
import {
  resolveGitHubBranchName,
  resolveGitHubRepositoryCoordinates,
} from '../workflow-context/github-repository-context';

interface JulesApiClientLike {
  createSession: JulesApiClient['createSession'];
  listSources: JulesApiClient['listSources'];
}

interface CreateJulesSessionServices {
  createClient(apiKey: string): JulesApiClientLike;
  resolveRepositoryCoordinates(): ReturnType<
    typeof resolveGitHubRepositoryCoordinates
  >;
  resolveBranchName(): string;
  resolveSource(
    client: JulesApiClientLike,
    input: Parameters<typeof resolveSourceName>[1],
  ): Promise<string>;
}

const defaultServices: CreateJulesSessionServices = {
  createClient: (apiKey) => new JulesApiClient(apiKey),
  resolveRepositoryCoordinates: resolveGitHubRepositoryCoordinates,
  resolveBranchName: resolveGitHubBranchName,
  resolveSource: resolveSourceName,
};

export async function createJulesSession(
  request: CreateSessionActionRequest,
  services: CreateJulesSessionServices = defaultServices,
): Promise<Session> {
  const client = services.createClient(request.apiKey);
  const repository = services.resolveRepositoryCoordinates();
  const startingBranch = request.startingBranch ?? services.resolveBranchName();
  const source = await services.resolveSource(client, {
    explicitSourceName: request.source,
    fallbackRepository: repository,
  });
  const payload = buildCreateSessionPayload({
    prompt: request.prompt,
    title: request.title,
    requirePlanApproval: request.requirePlanApproval,
    automationMode: request.automationMode,
    source,
    startingBranch,
  });

  return client.createSession(payload);
}
