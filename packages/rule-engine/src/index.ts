// Core engine
export { Token } from './Token';
export type { TokenType, TokenObj } from './Token';
export { Tokenizer } from './Tokenizer';
export { Parser } from './Parser';
export { Interpreter } from './Interpreter';
export { Environment } from './Environment';
export { Logger } from './Logger';

// Orchestrator
export { RuleEngine } from './RuleEngine';
export type { Rule, TraceEntry, SerializedRule } from './RuleEngine';

// Backward chaining
export { BackwardChainer } from './BackwardChainer';
export type { DeductiveRule, CandidateResult, ProveResult } from './BackwardChainer';

// AST nodes
export {
  type ASTNode,
  ArrayLiteral, AssignmentExpression, BinaryExpression, BooleanNode,
  CallExpression, GroupExpression, Identifier, IndexExpression, LogicalExpression,
  MemberExpression, NumberNode, StringNode, UnaryExpression,
} from './ast/ASTNode';

// AST visitor + utilities
export type { ASTNodeVisitor } from './ast/ASTNodeVisitor';
export { ASTtoJSON } from './ast/ASTtoJSON';
export { ASTtoString } from './ast/ASTtoString';

// Constraint solver
export { ConstraintSolver, NoSolutionError } from './ConstraintSolver';
export type { SolveOptions, SolveResult } from './ConstraintSolver';

// Errors
export { RuleEngineError, ParseError, EvalError, UndefinedVarError } from './errors';
