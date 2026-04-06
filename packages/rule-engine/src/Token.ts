export const Token = {
  ASSIGN:      "ASSIGN",
  BOOLEAN:     "BOOLEAN",
  DOT:         "DOT",
  EQUALS:      "EQUALS",
  NUMBER:      "NUMBER",
  STRING:      "STRING",
  IDENTIFIER:  "IDENTIFIER",
  OPERATOR:    "OP",
  NOT:         "NOT",
  NOT_EQUAL:   "NOT_EQUAL",
  AND:         "AND",
  OR:          "OR",
  LPAREN:      "LPAREN",
  RPAREN:      "RPAREN",
  CONTAINS:    "CONTAINS",
  IN:          "IN",
  COMMA:       "COMMA",
  LBRACKET:    "LBRACKET",
  RBRACKET:    "RBRACKET",
  UNIT_SUFFIX: "UNIT_SUFFIX",
} as const;

export type TokenType = typeof Token[keyof typeof Token];

export interface TokenObj {
  type: string;
  value: string | number | boolean;
  line: number;
  column: number;
  /** Present on UNIT_SUFFIX tokens, e.g. "ss", "px" */
  suffix?: string;
}
