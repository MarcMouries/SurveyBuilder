export class RuleEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'RuleEngineError';
  }
}

export class ParseError extends RuleEngineError {
  line: number;
  col: number;
  constructor(message: string, line: number = 0, col: number = 0) {
    super(message);
    this.name = 'ParseError';
    this.line = line;
    this.col = col;
  }
}

export class EvalError extends RuleEngineError {
  ruleName?: string;
  constructor(message: string, ruleName?: string) {
    super(message);
    this.name = 'EvalError';
    this.ruleName = ruleName;
  }
}

export class UndefinedVarError extends EvalError {
  varName: string;
  constructor(varName: string, ruleName?: string) {
    super(`Undefined variable name '${varName}'`, ruleName);
    this.name = 'UndefinedVarError';
    this.varName = varName;
  }
}
