import { z } from 'zod';
import {
  automationModeInputSchema,
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
  requirePlanApproval: z.boolean(),
  automationMode: automationModeInputSchema,
});

export type CreateSessionActionRequest = z.infer<
  typeof createSessionActionRequestSchema
>;

export function resolveCreateSessionActionRequest(): CreateSessionActionRequest {
  const request = {
    apiKey: readRequiredEnvironmentVariable('JULES_API_KEY'),
    prompt: readRequiredInput('prompt'),
    source: readOptionalInput('source'),
    startingBranch: readOptionalInput('starting-branch'),
    title: readOptionalInput('title'),
    requirePlanApproval:
      readOptionalBooleanInput('require-plan-approval') ?? true,
    automationMode: readOptionalInput('automation-mode') ?? 'AUTO_CREATE_PR',
  };

  const parsedRequest = createSessionActionRequestSchema.safeParse(request);
  if (!parsedRequest.success) {
    throw new Error(
      parsedRequest.error.issues[0]?.message ?? 'Invalid inputs.',
    );
  }

  return parsedRequest.data;
}
