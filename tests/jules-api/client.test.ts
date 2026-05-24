import { afterEach, describe, expect, it, vi } from 'vitest';
import { JulesApiClient } from '../../src/jules-api/client';
import { JulesApiError } from '../../src/jules-api/errors';

describe('JulesApiClient', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('calls sources.list with filter and validates response shape', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          sources: [{ name: 'sources/github/acme/repo', id: 'repo-1' }],
        }),
        { status: 200 },
      ),
    );

    const client = new JulesApiClient('api-key');
    const response = await client.listSources('name=sources/github/acme/repo');

    const [requestUrl, options] = fetchMock.mock.calls[0];
    expect(String(requestUrl)).toBe(
      'https://jules.googleapis.com/v1alpha/sources?pageSize=100&filter=name%3Dsources%2Fgithub%2Facme%2Frepo',
    );
    expect(options?.headers).toEqual({
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': 'api-key',
    });
    expect(response.sources).toEqual([
      { name: 'sources/github/acme/repo', id: 'repo-1' },
    ]);
  });

  it('calls sessions.create and returns parsed session', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          name: 'sessions/123',
          id: '123',
          prompt: 'Create tests',
          sourceContext: {
            source: 'sources/github/acme/repo',
            githubRepoContext: {
              startingBranch: 'main',
            },
          },
          state: 'QUEUED',
        }),
        { status: 200 },
      ),
    );

    const client = new JulesApiClient('api-key');
    const session = await client.createSession({
      prompt: 'Create tests',
      sourceContext: {
        source: 'sources/github/acme/repo',
        githubRepoContext: {
          startingBranch: 'main',
        },
      },
    });

    expect(session.name).toBe('sessions/123');
    expect(session.state).toBe('QUEUED');
  });

  it('throws JulesApiError on non-successful responses', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('invalid token', { status: 401 }),
    );

    const client = new JulesApiClient('api-key');
    await expect(client.listSources()).rejects.toBeInstanceOf(JulesApiError);
  });

  it('throws JulesApiError when the transport layer fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));

    const client = new JulesApiClient('api-key');
    await expect(client.listSources()).rejects.toMatchObject({
      status: 0,
      responseBody: 'network down',
    });
  });

  it('throws JulesApiError when a successful response body is empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 200 }),
    );

    const client = new JulesApiClient('api-key');
    await expect(client.listSources()).rejects.toMatchObject({
      status: 200,
      responseBody:
        'Expected a JSON response body but received an empty response.',
    });
  });

  it('throws JulesApiError when a successful response body is not valid JSON', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not json', { status: 200 }),
    );

    const client = new JulesApiClient('api-key');
    await expect(client.listSources()).rejects.toMatchObject({
      status: 200,
      responseBody: 'Failed to parse response as JSON: not json',
    });
  });
});
