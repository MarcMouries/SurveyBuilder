export const TokenType = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  VAR: "VAR",
  OPERATOR: "OP",
  AND: "AND",
  OR: "OR",
  LPAREN: "(",
  RPAREN: ")",
};
export class Tokenizer2 {
  constructor() {
    this.operators = [
      { match: "is between", type: "IS_BETWEEN", length: 10 },
      { match: "is not ", type: TokenType.OPERATOR, length: 6, value: "!=" },
      { match: "is", type: TokenType.OPERATOR, length: 2, value: "=" },
      { match: "=", type: TokenType.OPERATOR, length: 1 },
      { match: "==", type: TokenType.OPERATOR, length: 2 },
      { match: "!=", type: TokenType.OPERATOR, length: 2 },
      { match: "and", type: "AND", length: 3 },
      { match: "or", type: "OR", length: 2 },
      { match: "not", type: "NOT", length: 3 },
      { match: "true", type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 },
      { match: "+", type: TokenType.OPERATOR, length: 1 },
      { match: "-", type: TokenType.OPERATOR, length: 1 },
      { match: "*", type: TokenType.OPERATOR, length: 1 },
      { match: "/", type: TokenType.OPERATOR, length: 1 },
      { match: "^", type: TokenType.OPERATOR, length: 1 },
      { match: "(", type: "LPAREN", length: 1 },
      { match: ")", type: "RPAREN", length: 1 },
      { match: ",", type: ",", length: 1 },
      { match: ">=", type: TokenType.OPERATOR, length: 2 },
      { match: "<=", type: TokenType.OPERATOR, length: 2 },
      { match: ">", type: TokenType.OPERATOR, length: 1 },
      { match: "<", type: TokenType.OPERATOR, length: 1 },

    ];
    this.tokens = [];
  }

  isDigit(char) {
    return char >= "0" && char <= "9";
  }

  isAlpha(char) {
    return (char >= "a" && char <= "z") || (char >= "A" && char <= "Z") || char === "_" || char === ".";
  }

  isAlphaNumeric(char) {
    return this.isAlpha(char) || this.isDigit(char);
  }

  findMatchingOperator(input, position) {
    for (const pattern of this.operators) {
      if (input.substr(position, pattern.length) === pattern.match) {
        return pattern;
      }
    }
    return null; // No pattern matched
  }

  parseTokens(input) {
    this.tokens = []; // Reset tokens for each call
    let position = 0;

    while (position < input.length) {
      let char = input[position];

      // Skip whitespace
      if (/\s/.test(char)) {
        position++;
        continue;
      }

      // String literals
      if (char === '"' || char === "'") {
        let endChar = char;
        let stringLiteral = "";
        position++; // Move past the opening quote
        char = input[position];

        while (position < input.length && char !== endChar) {
          stringLiteral += char;
          position++;
          char = input[position];
        }

        if (char === endChar) {
          this.tokens.push({ type: TokenType.STRING, value: stringLiteral });
          position++; // Move past the closing quote
          continue;
        } else {
          throw new Error("Syntax error: unclosed string literal");
        }
      }

      // Number parsing
      if (this.isDigit(char)) {
        let number = "";
        while (this.isDigit(char) || char === ".") {
          number += char;
          char = input[++position];
        }
        this.tokens.push({ type: TokenType.NUMBER, value: parseFloat(number) });
        continue;
      }

      // Try to match operators or keywords
      const operatorOrKeyword = this.findMatchingOperator(input, position);
      if (operatorOrKeyword) {
        if (operatorOrKeyword.match === "true" || operatorOrKeyword.match === "false") {
          this.tokens.push({ type: TokenType.BOOLEAN, value: operatorOrKeyword.match === "true" });
        } else {
          // Use the 'value' property for operators like "is" and "is not"
          let tokenValue = operatorOrKeyword.value ? operatorOrKeyword.value : operatorOrKeyword.match;
          this.tokens.push({ type: operatorOrKeyword.type, value: tokenValue });
        }
        position += operatorOrKeyword.length;
        continue;
      }

      // Identifiers
      if (this.isAlpha(char)) {
        let identifier = "";
        while (this.isAlphaNumeric(char)) {
          identifier += char;
          char = input[++position];
        }
        this.tokens.push({ type: TokenType.VAR, value: identifier });
        continue;
      }

      position++; // Move to the next character if no token is matched
    }
    return this.tokens;
  }
}
