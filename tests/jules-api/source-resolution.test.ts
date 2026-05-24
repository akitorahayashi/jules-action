import { describe, expect, it, vi } from 'vitest';
import {
  buildRepositorySourceName,
  resolveSourceName,
} from '../../src/jules-api/source-resolution';

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
  it('prefers explicit source input', async () => {
    const listSources = vi.fn().mockResolvedValue({
      sources: [{ name: 'sources/github/acme/repo' }],
    });

    const sourceName = await resolveSourceName(
      { listSources },
      {
        explicitSourceName: 'sources/github/acme/repo',
        fallbackRepository: { owner: 'ignored', repo: 'ignored' },
      },
    );

    expect(listSources).toHaveBeenCalledWith('name=sources/github/acme/repo');
    expect(sourceName).toBe('sources/github/acme/repo');
  });

  it('treats an empty explicit source as absent and falls back to the repository', async () => {
    const listSources = vi.fn().mockResolvedValue({
      sources: [{ name: 'sources/github/acme/repo' }],
    });

    const sourceName = await resolveSourceName(
      { listSources },
      {
        explicitSourceName: '   ',
        fallbackRepository: { owner: 'acme', repo: 'repo' },
      },
    );

    expect(listSources).toHaveBeenCalledWith('name=sources/github/acme/repo');
    expect(sourceName).toBe('sources/github/acme/repo');
  });

  it('fails when no matching source exists', async () => {
    const listSources = vi.fn().mockResolvedValue({ sources: [] });

    await expect(
      resolveSourceName(
        { listSources },
        {
          fallbackRepository: { owner: 'acme', repo: 'repo' },
        },
      ),
    ).rejects.toThrow(
      "No Jules source matched 'sources/github/acme/repo'. Install the Jules GitHub app for that repository.",
    );
  });
});
