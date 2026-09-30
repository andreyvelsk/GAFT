import { z } from 'zod';

/** Agents that can be configured with a dedicated model. */
export const agentNameSchema = z.enum([
  'filter',
  'match',
  'create',
  'update',
  'category',
]);

export type AgentName = z.infer<typeof agentNameSchema>;

/** Resolved model id per agent. */
export type ModelMap = Record<AgentName, string>;

/** Options controlling model resolution. */
export interface ResolveModelOptions {
  /** Environment to read from (defaults to `process.env`). */
  env?: NodeJS.ProcessEnv;
}
