import { ApiError, sourceName } from 'jls';
import { describe, expect, it, vi } from 'vitest';
import {
  buildRepositorySourceName,
  resolveSourceName,
} from '../../src/app/source-resolution';

function apiError(code: number, status: string): ApiError {
  return new ApiError({
    code,
    message: 'Requested entity was not found.',
    status,
    details: [],
  });
}

describe('buildRepositorySourceName', () => {
  it('builds source name from owner and repo', () => {
    expect(
      buildRepositorySourceName({
        owner: 'acme',
        repo: 'repo',
      }),
    ).toBe('sources/github/acme/repo');
  });
});

describe('resolveSourceName', () => {
  it('prefers explicit source input and returns the canonical name', async () => {
    const getSource = vi.fn().mockResolvedValue({
      name: sourceName('sources/github/acme/repo'),
    });

    const resolved = await resolveSourceName(
      { getSource },
      {
        explicitSourceName: sourceName('sources/github/acme/repo'),
        fallbackRepository: { owner: 'ignored', repo: 'ignored' },
      },
    );

    expect(getSource).toHaveBeenCalledWith('sources/github/acme/repo');
    expect(resolved).toBe('sources/github/acme/repo');
  });

  it('falls back to the workflow repository when no explicit source is given', async () => {
    const getSource = vi.fn().mockResolvedValue({
      name: sourceName('sources/github/acme/repo'),
    });

    const resolved = await resolveSourceName(
      { getSource },
      {
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );

    expect(getSource).toHaveBeenCalledWith('sources/github/acme/repo');
    expect(resolved).toBe('sources/github/acme/repo');
  });

  it('fails with installation guidance when the source does not exist', async () => {
    const getSource = vi.fn().mockRejectedValue(apiError(404, 'NOT_FOUND'));

    await expect(
      resolveSourceName(
        { getSource },
        {
          fallbackRepository: { owner: 'acme', repo: 'repo' },
        },
      ),
    ).rejects.toThrow(
      "No Jules source matched 'sources/github/acme/repo'. Install the Jules GitHub app for that repository.",
    );
  });

  it('rethrows API errors other than not-found', async () => {
    const error = apiError(403, 'PERMISSION_DENIED');
    const getSource = vi.fn().mockRejectedValue(error);

    await expect(
      resolveSourceName(
        { getSource },
        {
          fallbackRepository: { owner: 'acme', repo: 'repo' },
        },
      ),
    ).rejects.toBe(error);
  });

  it('fails when neither source input nor repository is available', async () => {
    const getSource = vi.fn();

    await expect(resolveSourceName({ getSource }, {})).rejects.toThrow(
      "Input 'source' is required when GITHUB_REPOSITORY is not available.",
    );
    expect(getSource).not.toHaveBeenCalled();
  });
});
