import { z } from 'zod';
import {
  type AutomationMode,
  automationModeSchema,
  type SourceName,
  sourceContextSchema,
  sourceNameSchema,
} from './session-contract';

const createSessionPayloadSchema = z.object({
  prompt: z.string().min(1),
  sourceContext: sourceContextSchema,
  title: z.string().min(1).optional(),
  requirePlanApproval: z.boolean().optional(),
  automationMode: automationModeSchema.optional(),
});

export type CreateSessionPayload = z.infer<typeof createSessionPayloadSchema>;

export interface BuildCreateSessionPayloadInput {
  prompt: string;
  source: SourceName;
  startingBranch: string;
  title?: string;
  requirePlanApproval?: boolean;
  automationMode?: AutomationMode;
}

export function buildCreateSessionPayload(
  input: BuildCreateSessionPayloadInput,
): CreateSessionPayload {
  const payload = {
    prompt: input.prompt,
    sourceContext: {
      source: sourceNameSchema.parse(input.source),
      githubRepoContext: {
        startingBranch: input.startingBranch,
      },
    },
    title: input.title,
    requirePlanApproval: input.requirePlanApproval,
    automationMode: input.automationMode,
  };

  return createSessionPayloadSchema.parse(payload);
}
