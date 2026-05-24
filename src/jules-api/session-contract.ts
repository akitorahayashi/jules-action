import { z } from 'zod';
import {
  automationModes,
  sessionNamePattern,
  sessionStates,
  sourceNamePattern,
} from './contract';

export const automationModeSchema = z.enum(automationModes, {
  message:
    "Input 'automation-mode' must be one of: AUTOMATION_MODE_UNSPECIFIED, AUTO_CREATE_PR.",
});

export type AutomationMode = z.infer<typeof automationModeSchema>;

export const sourceNameSchema = z
  .string()
  .regex(
    sourceNamePattern,
    "Input 'source' must be in the form 'sources/{source}'.",
  );

const sessionNameSchema = z
  .string()
  .regex(
    sessionNamePattern,
    "Session name must be in the form 'sessions/{session}'.",
  );

const sessionStateSchema = z.enum(sessionStates);

const gitHubRepoContextSchema = z.object({
  startingBranch: z.string().min(1),
});

export const sourceContextSchema = z.object({
  source: sourceNameSchema,
  githubRepoContext: gitHubRepoContextSchema.optional(),
});

const pullRequestSchema = z.object({
  url: z.string(),
  title: z.string(),
  description: z.string(),
});

const sessionOutputSchema = z.object({
  pullRequest: pullRequestSchema.optional(),
});

export const sessionSchema = z.object({
  name: sessionNameSchema,
  id: z.string().min(1),
  prompt: z.string().min(1),
  sourceContext: sourceContextSchema,
  title: z.string().optional(),
  requirePlanApproval: z.boolean().optional(),
  automationMode: automationModeSchema.optional(),
  state: sessionStateSchema.optional(),
  url: z.string().optional(),
  outputs: z.array(sessionOutputSchema).optional(),
});

export type Session = z.infer<typeof sessionSchema>;

export const sourceSchema = z.object({
  name: sourceNameSchema,
  id: z.string().min(1).optional(),
});

export const listSourcesResponseSchema = z.object({
  sources: z.array(sourceSchema).default([]),
  nextPageToken: z.string().optional(),
});

export type ListSourcesResponse = z.infer<typeof listSourcesResponseSchema>;
