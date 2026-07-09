import {
  Client,
  createSessionRequest,
  DEFAULT_BASE_URL,
  githubSourceContext,
  type Session,
  type SourceName,
  startingBranch,
} from 'jls';
import type { CreateSessionActionRequest } from '../action/create-session-request';
import {
  type GitHubRepositoryCoordinates,
  resolveGitHubBranchName,
  resolveGitHubRepositoryCoordinates,
} from '../workflow-context/github-repository-context';
import {
  type ResolveSourceNameInput,
  resolveSourceName,
  type SourceLookupClient,
} from './source-resolution';

interface JulesClientLike extends SourceLookupClient {
  createSession: Client['createSession'];
}

interface CreateJulesSessionServices {
  createClient(apiKey: string): JulesClientLike;
  resolveRepositoryCoordinates(): GitHubRepositoryCoordinates;
  resolveBranchName(): string;
  resolveSource(
    client: SourceLookupClient,
    input: ResolveSourceNameInput,
  ): Promise<SourceName>;
}

const defaultServices: CreateJulesSessionServices = {
  createClient: (apiKey) => new Client({ baseUrl: DEFAULT_BASE_URL, apiKey }),
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
  const branch =
    request.startingBranch ?? startingBranch(services.resolveBranchName());
  const source = await services.resolveSource(client, {
    explicitSourceName: request.source,
    fallbackRepository: repository,
  });

  return client.createSession(
    createSessionRequest({
      prompt: request.prompt,
      sourceContext: githubSourceContext(source, branch),
      title: request.title,
      requirePlanApproval: request.requirePlanApproval,
      automationMode: request.automationMode,
    }),
  );
}
