import * as core from '@actions/core';
import type { Session } from '../jules-api/session-contract';

function emitOutput(name: string, value: string | undefined): void {
  core.setOutput(name, value ?? '');
}

export function emitCreateSessionOutputs(session: Session): void {
  emitOutput('session-name', session.name);
  emitOutput('session-id', session.id);
  emitOutput('resolved-source', session.sourceContext.source);
  emitOutput('session-title', session.title);
  emitOutput('session-state', session.state);
  emitOutput('session-url', session.url);
}
