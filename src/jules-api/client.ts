import { julesApiVersionBaseUrl, sourcesPageSizeMaximum } from './contract';
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

    const response = await fetch(requestUrl, {
      method: options?.method ?? 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': this.apiKey,
      },
      body: options?.payload ? JSON.stringify(options.payload) : undefined,
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new JulesApiError(response.status, responseText);
    }

    if (!responseText) {
      return {};
    }

    return JSON.parse(responseText) as unknown;
  }
}
