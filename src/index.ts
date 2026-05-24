import * as core from '@actions/core';
import { resolveCreateSessionActionRequest } from './action/create-session-request';
import { emitCreateSessionOutputs } from './action/outputs';
import { createJulesSession } from './app/create-jules-session';

async function run(): Promise<void> {
  const request = resolveCreateSessionActionRequest();
  core.setSecret(request.apiKey);

  const session = await createJulesSession(request);
  emitCreateSessionOutputs(session);
  core.info(`Created Jules session '${session.name}'.`);
}

if (require.main === module) {
  run().catch((error: unknown) => {
    if (error instanceof Error) {
      core.setFailed(error.message);
      return;
    }
    core.setFailed(String(error));
  });
}
