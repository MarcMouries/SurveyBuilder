import { Token } from './Token';
import type { TokenObj } from './Token';

interface TokenEntry {
  match: string;
  type: string;
  value?: string | boolean | number;
}

interface BooleanEntry {
  match: string;
  type: string;
  length: number;
}

export class Tokenizer {
  private compactOperators: TokenEntry[];
  private spaceSensitiveKeywords: TokenEntry[];
  private booleans: BooleanEntry[];
  private tokens: TokenObj[];

  constructor() {
    this.compactOperators = [
      { match: "==", type: Token.EQUALS,    value: "==" },
      { match: "=",  type: Token.ASSIGN,    value: "=" },
      { match: "!=", type: Token.NOT_EQUAL, value: "!=" },
      { match: "!",  type: Token.NOT,       value: "!" },
      { match: "+",  type: Token.OPERATOR,  value: "+" },
      { match: "-",  type: Token.OPERATOR,  value: "-" },
      { match: "*",  type: Token.OPERATOR,  value: "*" },
      { match: "/",  type: Token.OPERATOR,  value: "/" },
      { match: "^",  type: Token.OPERATOR,  value: "^" },
      { match: "(",  type: Token.LPAREN,    value: "(" },
      { match: ")",  type: Token.RPAREN,    value: ")" },
      { match: ",",  type: Token.COMMA,     value: "," },
      { match: ">=", type: Token.OPERATOR,  value: ">=" },
      { match: "<=", type: Token.OPERATOR,  value: "<=" },
      { match: ">",  type: Token.OPERATOR,  value: ">" },
      { match: "<",  type: Token.OPERATOR,  value: "<" },
      { match: ".",  type: Token.DOT,       value: "." },
      { match: "[",  type: Token.LBRACKET,  value: "[" },
      { match: "]",  type: Token.RBRACKET,  value: "]" },
    ];

    this.spaceSensitiveKeywords = [
      { match: "and",        type: Token.AND },
      { match: "contains",   type: Token.CONTAINS },
      { match: "in",         type: Token.IN },
      { match: "or",         type: Token.OR },
      { match: "not",        type: Token.NOT },
      { match: "is between", type: "IS_BETWEEN" },
      { match: "is not",     type: Token.NOT_EQUAL, value: "!=" },
      { match: "is",         type: Token.EQUALS,    value: "==" },
    ];

    this.booleans = [
      { match: "true",  type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 },
    ];

    this.tokens = [];
  }

  private isDigit(char: string): boolean {
    return char >= "0" && char <= "9";
  }

  private isAlpha(char: string): boolean {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z");
  }

  private isAlphaNumeric(char: string): boolean {
    return this.isAlpha(char) || this.isDigit(char) || char === "_" || char === "-";
  }

  /**
   * Returns true if `char` can continue an identifier being read character-by-character.
   * Hyphens are allowed only when immediately followed by a letter, so `use-federal-forms`
   * is one identifier but `i-1` splits into identifier `i`, operator `-`, number `1`.
   */
  private isIdentifierContinuation(char: string, nextChar: string | undefined): boolean {
    if (this.isAlpha(char) || this.isDigit(char) || char === "_") return true;
    if (char === "-") return nextChar !== undefined && this.isAlpha(nextChar);
    return false;
  }

  private matchToken(input: string, position: number, tokenList: TokenEntry[]): TokenEntry | null {
    for (const token of tokenList) {
      if (input.startsWith(token.match, position)) {
        return token;
      }
    }
    return null;
  }

  parseTokens(input: string): TokenObj[] {
    this.tokens = [];
    let position = 0;
    let column = 1;
    let line = 1;

    while (position < input.length) {
      const char = input[position];

      if (char === '\n') {
        line++;
        column = 1;
        position++;
        continue;
      }

      if (/\s/.test(char)) {
        position++; column++;
        continue;
      }

      // String literals
      if (char === '"' || char === "'") {
        const endChar = char;
        let stringLiteral = "";
        position++; column++;
        let cur = input[position];
        while (position < input.length && cur !== endChar) {
          stringLiteral += cur;
          position++; column++;
          cur = input[position];
        }
        if (cur === endChar) {
          this.tokens.push({ type: Token.STRING, value: stringLiteral, line, column });
          position++; column++;
          continue;
        }
        throw new Error("Syntax error: unclosed string literal");
      }

      // Number parsing — check for unit suffix after the number
      if (this.isDigit(char)) {
        let number = "";
        const startColumn = column;
        let c = input[position];
        while (position < input.length && (this.isDigit(c) || c === ".")) {
          number += c;
          position++; column++;
          c = input[position];
        }
        const numVal = parseFloat(number);

        // Check for unit suffix (e.g. "ss", "px", "sp")
        if (position < input.length && this.isAlpha(input[position])) {
          let suffix = "";
          let sc = input[position];
          while (position < input.length && this.isAlpha(sc)) {
            suffix += sc;
            position++; column++;
            sc = input[position];
          }
          this.tokens.push({ type: Token.UNIT_SUFFIX, value: numVal, line, column: startColumn, suffix });
        } else {
          this.tokens.push({ type: Token.NUMBER, value: numVal, line, column: startColumn });
        }
        continue;
      }

      const compactOp = this.matchToken(input, position, this.compactOperators);
      if (compactOp) {
        this.tokens.push({ type: compactOp.type, value: compactOp.match, line, column });
        position += compactOp.match.length;
        column += compactOp.match.length;
        continue;
      }

      const boolOp = this.booleans.find(b => input.startsWith(b.match, position));
      if (boolOp) {
        this.tokens.push({ type: Token.BOOLEAN, value: boolOp.match === "true", line, column });
        position += boolOp.match.length;
        column += boolOp.match.length;
        continue;
      }

      const keyword = this.matchToken(input, position, this.spaceSensitiveKeywords);
      if (keyword) {
        const operatorEndPosition = position + keyword.match.length;
        const charAfterMatch = input[operatorEndPosition];
        if (charAfterMatch === undefined || !this.isAlphaNumeric(charAfterMatch)) {
          const tokenValue = keyword.value !== undefined ? keyword.value : keyword.match;
          this.tokens.push({ type: keyword.type, value: tokenValue as string, line, column });
          position += keyword.match.length;
          column += keyword.match.length;
          continue;
        }
      }

      // Identifiers
      if (this.isAlpha(char)) {
        let identifier = "";
        while (position < input.length) {
          const c = input[position];
          const next = input[position + 1];
          if (!this.isIdentifierContinuation(c, next)) break;
          identifier += c;
          position++; column++;
        }
        this.tokens.push({ type: Token.IDENTIFIER, value: identifier, line, column });
        continue;
      }

      position++; column++;
    }
    return this.tokens;
  }
}
