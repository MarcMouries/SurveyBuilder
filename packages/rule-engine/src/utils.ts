import { Environment } from './Environment';

export type Facts = Record<string, unknown> | Environment;

/** Normalise a Facts argument to an Environment. Creates a new one from a plain object; returns an existing Environment as-is. */
export function toEnvironment(facts: Facts): Environment {
  if (facts instanceof Environment) return facts;
  return Environment.from(facts);
}
