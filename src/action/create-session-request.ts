import {
  AutomationMode,
  isKnownAutomationMode,
  type KnownAutomationMode,
  type Prompt,
  prompt,
  type SourceName,
  type StartingBranch,
  sourceName,
  startingBranch,
  type Title,
  title,
  ValidationError,
} from 'jls';
import {
  readOptionalBooleanInput,
  readOptionalInput,
  readRequiredEnvironmentVariable,
  readRequiredInput,
} from './inputs';

export interface CreateSessionActionRequest {
  apiKey: string;
  prompt: Prompt;
  source?: SourceName;
  startingBranch?: StartingBranch;
  title?: Title;
  requirePlanApproval: boolean;
  automationMode: KnownAutomationMode;
}

function parseInput<Value>(
  name: string,
  rawValue: string,
  parse: (raw: string) => Value,
): Value {
  try {
    return parse(rawValue);
  } catch (error) {
    if (error instanceof ValidationError) {
      throw new Error(`Input '${name}' is invalid: ${error.message}.`);
    }
    throw error;
  }
}

function parseOptionalInput<Value>(
  name: string,
  parse: (raw: string) => Value,
): Value | undefined {
  const rawValue = readOptionalInput(name);
  if (rawValue === undefined) {
    return undefined;
  }
  return parseInput(name, rawValue, parse);
}

function readAutomationModeInput(): KnownAutomationMode {
  const value =
    readOptionalInput('automation-mode') ?? AutomationMode.AutoCreatePr;
  if (!isKnownAutomationMode(value)) {
    throw new Error(
      `Input 'automation-mode' must be one of: ${Object.values(
        AutomationMode,
      ).join(', ')}.`,
    );
  }
  return value;
}

export function resolveCreateSessionActionRequest(): CreateSessionActionRequest {
  return {
    apiKey: readRequiredEnvironmentVariable('JULES_API_KEY'),
    prompt: parseInput('prompt', readRequiredInput('prompt'), prompt),
    source: parseOptionalInput('source', sourceName),
    startingBranch: parseOptionalInput('starting-branch', startingBranch),
    title: parseOptionalInput('title', title),
    requirePlanApproval:
      readOptionalBooleanInput('require-plan-approval') ?? true,
    automationMode: readAutomationModeInput(),
  };
}
