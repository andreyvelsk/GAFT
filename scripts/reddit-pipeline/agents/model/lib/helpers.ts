import { DEFAULT_MODELS } from '../../../shared/lib/constants';
import type { AgentName, ModelMap, ResolveModelOptions } from './types';

/** Environment variable holding the model of each agent. */
export const AGENT_MODEL_ENV: Record<AgentName, string> = {
  filter: 'REDDIT_FILTER_MODEL',
  match: 'REDDIT_MATCH_MODEL',
  create: 'REDDIT_CREATE_MODEL',
  update: 'REDDIT_UPDATE_MODEL',
};

/** Environment variable holding the global fallback model. */
export const DEFAULT_MODEL_ENV = 'OPENROUTER_DEFAULT_MODEL';

/** Read a non-blank env value, treating missing/blank values as unset. */
function readEnv(env: NodeJS.ProcessEnv, name: string): string | undefined {
  const value = env[name];
  if (value === undefined || value.trim() === '') {
    return undefined;
  }
  return value;
}

/** Fallback model id of an agent, taken from the shared constants. */
export function fallbackModel(agent: AgentName): string {
  return DEFAULT_MODELS[agent];
}

/**
 * Resolve the model of an agent, in order of precedence:
 * `REDDIT_<AGENT>_MODEL` → `OPENROUTER_DEFAULT_MODEL` → agent fallback.
 */
export function resolveModel(
  agent: AgentName,
  options: ResolveModelOptions = {},
): string {
  const env = options.env ?? process.env;
  return (
    readEnv(env, AGENT_MODEL_ENV[agent]) ??
    readEnv(env, DEFAULT_MODEL_ENV) ??
    fallbackModel(agent)
  );
}

/** Resolve the model of every agent at once. */
export function resolveModels(options: ResolveModelOptions = {}): ModelMap {
  return {
    filter: resolveModel('filter', options),
    match: resolveModel('match', options),
    create: resolveModel('create', options),
    update: resolveModel('update', options),
  };
}
