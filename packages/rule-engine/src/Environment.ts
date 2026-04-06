import { UndefinedVarError } from './errors';

export class Environment {
  private values = new Map<string, unknown>();

  define(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  set(name: string, value: unknown): void {
    this.values.set(name, value);
  }

  get(name: string): unknown {
    if (this.values.has(name)) {
      return this.values.get(name);
    }
    throw new UndefinedVarError(name);
  }

  getOrDefault(name: string, defaultValue: unknown): unknown {
    return this.values.has(name) ? this.values.get(name) : defaultValue;
  }

  static from(values: Record<string, unknown> | Map<string, unknown>): Environment {
    const env = new Environment();
    if (values instanceof Map) {
      values.forEach((v, k) => env.define(k, v));
    } else {
      for (const [k, v] of Object.entries(values)) {
        env.define(k, v);
      }
    }
    return env;
  }

  snapshot(): Record<string, unknown> {
    return Object.fromEntries(this.values);
  }

  toString(): string {
    let result = "Environment {";
    if (this.values.size > 0) {
      const entries = Array.from(this.values).map(([key, value]) =>
        `\n    "${key}": ${JSON.stringify(value, null, 4).replace(/\n/g, '\n    ')}`
      );
      result += entries.join(',') + '\n';
    }
    result += "}";
    return result;
  }
}
