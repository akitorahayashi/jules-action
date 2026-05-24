import {
  julesApiRequestTimeoutMs,
  julesApiVersionBaseUrl,
  sourcesPageSizeMaximum,
} from './contract';
import type { CreateSessionPayload } from './create-session-payload';
import { JulesApiError } from './errors';
import {
  type ListSourcesResponse,
  listSourcesResponseSchema,
  type Session,
  sessionSchema,
} from './session-contract';

export class JulesApiClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string = julesApiVersionBaseUrl) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  async listSources(filter?: string): Promise<ListSourcesResponse> {
    const query = new URLSearchParams();
    query.set('pageSize', String(sourcesPageSizeMaximum));
    if (filter) {
      query.set('filter', filter);
    }

    const responseBody = await this.request('sources', { query });
    return listSourcesResponseSchema.parse(responseBody);
  }

  async createSession(payload: CreateSessionPayload): Promise<Session> {
    const responseBody = await this.request('sessions', {
      method: 'POST',
      payload,
    });
    return sessionSchema.parse(responseBody);
  }

  private async request(
    path: string,
    options?: {
      method?: 'GET' | 'POST';
      query?: URLSearchParams;
      payload?: unknown;
    },
  ): Promise<unknown> {
    const requestUrl = new URL(path, this.baseUrl);
    if (options?.query) {
      requestUrl.search = options.query.toString();
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, julesApiRequestTimeoutMs);

    let response: Response;
    try {
      response = await fetch(requestUrl, {
        method: options?.method ?? 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': this.apiKey,
        },
        body: options?.payload ? JSON.stringify(options.payload) : undefined,
        signal: controller.signal,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown transport error.';
      throw new JulesApiError(0, message);
    } finally {
      clearTimeout(timeout);
    }

    const responseText = await response.text();
    if (!response.ok) {
      throw new JulesApiError(response.status, responseText);
    }

    if (!responseText) {
      throw new JulesApiError(
        response.status,
        'Expected a JSON response body but received an empty response.',
      );
    }

    try {
      return JSON.parse(responseText) as unknown;
    } catch {
      throw new JulesApiError(
        response.status,
        `Failed to parse response as JSON: ${responseText}`,
      );
    }
  }
}
