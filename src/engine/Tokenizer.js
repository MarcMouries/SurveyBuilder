import { Token } from "./Token";

export class Tokenizer {
  constructor() {

    //Operators that don't require Whitespace separation:
    this.compactOperators = [
      { match: "==", type: Token.EQUALS, value: "==" },
      { match: "=",  type: Token.ASSIGN, value: "=" },
      { match: "!=", type: Token.NOT_EQUAL, value: "!=" },
      { match: "!",  type: Token.NOT, value: "!" },
      { match: "+",  type: Token.OPERATOR, value: "+" },
      { match: "-",  type: Token.OPERATOR, value: "-" },
      { match: "*",  type: Token.OPERATOR, value: "*" },
      { match: "/",  type: Token.OPERATOR, value: "/" },
      { match: "^",  type: Token.OPERATOR, value: "^" },
      { match: "(",  type: Token.LPAREN,   value: "(" },
      { match: ")",  type: Token.RPAREN,   value: ")" },
      { match: ",",  type: Token.COMMA,    value: "," },
      { match: ">=", type: Token.OPERATOR, value: ">=" },
      { match: "<=", type: Token.OPERATOR, value: "<=" },
      { match: ">",  type: Token.OPERATOR, value: ">" },
      { match: "<",  type: Token.OPERATOR, value: "<" },
      { match: ".",  type: Token.DOT,      value: "." },
      { match: "[",  type: Token.LBRACKET, value: "[" },
      { match: "]",  type: Token.RBRACKET, value: "]" },
    ];

    this.spaceSensitiveKeywords = [
      { match: "and",        type: Token.AND },
      { match: "contains",   type: Token.CONTAINS },
      { match: "in",         type: Token.IN },
      { match: "or",         type: Token.OR },
      { match: "not",        type: Token.NOT },
      { match: "is between", type: "IS_BETWEEN" },
      { match: "is not",     type: Token.NOT_EQUAL, value: "!=" },
      { match: "is",         type: Token.EQUALS, value: "==" },
    ];

    this.booleans = [
      { match: "true",  type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 },
    ]

    this.tokens = [];
  }

  isDigit(char) {
    return char >= "0" && char <= "9";
  }

  isAlpha(char) {
    return (char >= "a" && char <= "z")
        || (char >= "A" && char <= "Z");
  }

  isAlphaNumeric(char) {
    return this.isAlpha(char)
     || this.isDigit(char)
     || char === "_" || char === "-";
  }

  matchToken(input, position, tokenList) {
    for (const token of tokenList) {
      if (input.startsWith(token.match, position)) {
        return token;
      }
    }
    return null;
  }

  parseTokens(input) {
    this.tokens = [];
    let position = 0;
    let column = 1; // Start columns at 1 for readability
    let line = 1;

    while (position < input.length) {
      let char = input[position];

      // New line 
      if (char === '\n') {
        line++;
        column = 1;
      }

      // Skip whitespace
      if (/\s/.test(char)) {
        position++; column++;
        continue;
      }

      // String literals
      if (char === '"' || char === "'") {
        let endChar = char;
        let stringLiteral = "";
        position++; column++; // Move past the opening quote
        char = input[position];

        while (position < input.length && char !== endChar) {
          stringLiteral += char;
          position++; column++;
          char = input[position];
        }

        if (char === endChar) {
          this.tokens.push({ type: Token.STRING, value: stringLiteral, line: line, column: column });
          position++; column++; // Move past the closing quote
          continue;
        } else {
          throw new Error("Syntax error: unclosed string literal");
        }
      }

      // Number parsing
      if (this.isDigit(char)) {
        let number = "";
        let startColumn = column;
        while (this.isDigit(char) || char === ".") {
          number += char;
          position++; column++;
          char = input[position];
        }
        this.tokens.push({ type: Token.NUMBER, value: parseFloat(number), line: line, column: startColumn });
        continue;
      }

      const compactOp = this.matchToken(input, position, this.compactOperators);
      if (compactOp) {
        this.tokens.push({ type: compactOp.type, value: compactOp.match, line: line, column: column });
        position += compactOp.match.length;
        column += compactOp.match.length;
        continue;
      }

      const boolOp = this.matchToken(input, position, this.booleans);
      if (boolOp) {
        this.tokens.push({ type: Token.BOOLEAN, value: boolOp.match === "true", line: line, column: column });
        position += boolOp.match.length;
        column += boolOp.match.length;
        continue;
      }

      /* Match with space sensitive operators and check the character after the match 
      to ensure the operator is not a prefix of a longer identifier or keyword*/
      const keyword = this.matchToken(input, position, this.spaceSensitiveKeywords);
      if (keyword) {
        const operatorEndPosition = position + keyword.match.length;
        const charAfterMatch = input[operatorEndPosition];
        if (charAfterMatch === undefined || !this.isAlphaNumeric(charAfterMatch)) {
          let tokenValue = keyword.value ? keyword.value : keyword.match;
          this.tokens.push({ type: keyword.type, value: tokenValue, line: line, column: column });
          position += keyword.match.length;
          column += keyword.match.length;
          continue;
        }
      }

      // Identifiers
      if (this.isAlpha(char)) {
        let identifier = "";
        while (this.isAlphaNumeric(char)) {
          identifier += char;
          position++; column++;
          char = input[position];
        }
        this.tokens.push({ type: Token.IDENTIFIER, value: identifier, line: line, column: column });
        continue;
      }
      position++; column++;
    }
    return this.tokens;
  }
}