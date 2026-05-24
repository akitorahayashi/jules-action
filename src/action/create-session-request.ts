import { z } from 'zod';
import {
  automationModeSchema,
  sourceNameSchema,
} from '../jules-api/session-contract';
import {
  readOptionalBooleanInput,
  readOptionalInput,
  readRequiredEnvironmentVariable,
  readRequiredInput,
} from './inputs';

const createSessionActionRequestSchema = z.object({
  apiKey: z.string().min(1),
  prompt: z.string().min(1),
  source: sourceNameSchema.optional(),
  startingBranch: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  requirePlanApproval: z.boolean().optional(),
  automationMode: automationModeSchema.optional(),
});

export type CreateSessionActionRequest = z.infer<
  typeof createSessionActionRequestSchema
>;

function readOptionalAutomationMode(): string | undefined {
  const automationMode = readOptionalInput('automation-mode');
  return automationMode;
}

export function resolveCreateSessionActionRequest(): CreateSessionActionRequest {
  const request = {
    apiKey: readRequiredEnvironmentVariable('JULES_API_KEY'),
    prompt: readRequiredInput('prompt'),
    source: readOptionalInput('source'),
    startingBranch: readOptionalInput('starting-branch'),
    title: readOptionalInput('title'),
    requirePlanApproval: readOptionalBooleanInput('require-plan-approval'),
    automationMode: readOptionalAutomationMode(),
  };

  const parsedRequest = createSessionActionRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    throw new Error(
      parsedRequest.error.issues[0]?.message ?? 'Invalid inputs.',
    );
  }

  return parsedRequest.data;
}
