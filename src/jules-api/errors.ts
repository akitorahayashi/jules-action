export class JulesApiError extends Error {
  readonly status: number;
  readonly responseBody: string;

  constructor(status: number, responseBody: string) {
    super(
      `Jules API request failed with status ${status}: ${
        responseBody || 'no response body'
      }`,
    );
    this.name = 'JulesApiError';
    this.status = status;
    this.responseBody = responseBody;
  }
}
