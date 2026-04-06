// ── Public API ────────────────────────────────────────────────────────────────

// Top-level convenience function
export { evaluate } from './evaluate';
export type { Facts } from './utils';

// Core types users need
export { Environment } from './Environment';

// Orchestrators
export { RuleEngine } from './RuleEngine';
export type { Rule, TraceEntry, SerializedRule } from './RuleEngine';

export { BackwardChainer } from './BackwardChainer';
export type { DeductiveRule, CandidateResult, ProveResult } from './BackwardChainer';

export { ConstraintSolver, NoSolutionError } from './ConstraintSolver';
export type { SolveOptions, SolveResult } from './ConstraintSolver';

// Errors
export { RuleEngineError, ParseError, EvalError, UndefinedVarError } from './errors';
