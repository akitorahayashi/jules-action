import { afterEach, describe, expect, it } from 'vitest';
import {
  resolveGitHubBranchName,
  resolveGitHubRepositoryCoordinates,
} from '../../src/workflow-context/github-repository-context';

const originalEnvironment = { ...process.env };

describe('resolveGitHubRepositoryCoordinates', () => {
  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it('parses owner and repo from GITHUB_REPOSITORY', () => {
    process.env.GITHUB_REPOSITORY = 'acme/repo';

    expect(resolveGitHubRepositoryCoordinates()).toEqual({
      owner: 'acme',
      repo: 'repo',
    });
  });

  it('fails when GITHUB_REPOSITORY is malformed', () => {
    process.env.GITHUB_REPOSITORY = 'acme/repo/extra';

    expect(() => resolveGitHubRepositoryCoordinates()).toThrow(
      "Environment variable 'GITHUB_REPOSITORY' must be in the form 'owner/repo'.",
    );
  });
});

describe('resolveGitHubBranchName', () => {
  afterEach(() => {
    process.env = { ...originalEnvironment };
  });

  it('uses GITHUB_HEAD_REF when available', () => {
    process.env.GITHUB_HEAD_REF = 'feature/refactor';

    expect(resolveGitHubBranchName()).toBe('feature/refactor');
  });

  it('falls back to branch ref name on branch workflows', () => {
    process.env.GITHUB_HEAD_REF = '';
    process.env.GITHUB_REF_TYPE = 'branch';
    process.env.GITHUB_REF_NAME = 'main';

    expect(resolveGitHubBranchName()).toBe('main');
  });

  it('fails when branch cannot be inferred', () => {
    process.env.GITHUB_HEAD_REF = '';
    process.env.GITHUB_REF_TYPE = 'tag';
    process.env.GITHUB_REF_NAME = 'v1.0.0';

    expect(() => resolveGitHubBranchName()).toThrow(
      "Unable to resolve the workflow branch. Set input 'starting-branch' or run on a branch ref.",
    );
  });
});
