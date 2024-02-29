export const TokenType = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  VAR: "VAR",
  EQUALS: "EQUALS",
  OPERATOR: "OPERATOR",
  LPAREN: "(",
  RPAREN: ")",
};
export class Tokenizer2 {
  constructor() {
    this.operators = [
      { match: "is between", type: "IS_BETWEEN", length: 10 },
      { match: "is not", type: "NOT_EQUAL", length: 6 },
      { match: "is", type: "EQUALS", length: 2 },
      { match: "==", type: "EQUALS", length: 2 },
      { match: "=", type: "EQUALS", length: 1 },
      { match: "!=", type: "NOT_EQUAL", length: 2 },
      { match: "and", type: "AND", length: 3 },
      { match: "or", type: "OR", length: 2 },
      { match: "not", type: "NOT", length: 3 },
      { match: "true", type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 },
      { match: "+", type: "+", length: 1 },
      { match: "-", type: "-", length: 1 },
      { match: "*", type: "*", length: 1 },
      { match: "/", type: "/", length: 1 },
      { match: "^", type: "^", length: 1 },
      { match: "(", type: "LPAREN", length: 1 },
      { match: ")", type: "RPAREN", length: 1 },
      { match: ",", type: ",", length: 1 },
      { match: ">", type: "GREATER_THAN", length: 1 },
      { match: "<", type: "LESS_THAN", length: 1 },
      { match: ">=", type: "GREATER_THAN_EQUAL", length: 2 },
      { match: "<=", type: "LESS_THAN_EQUAL", length: 2 },
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

      // Identifiers and keywords
      if (this.isAlpha(char)) {
        let identifier = "";
        while (this.isAlphaNumeric(char)) {
          identifier += char;
          char = input[++position];
        }
        // Check for specific keywords
        if (identifier === "true" || identifier === "false") {
          this.tokens.push({ type: TokenType.BOOLEAN, value: identifier === "true" });
        } else if (identifier === "is") {
          // Lookahead to check for specific patterns like 'is not', 'is between', etc.
          let nextWord = "";
          while (/\s/.test(input[position])) position++; // Skip whitespace
          while (this.isAlpha(input[position])) {
            nextWord += input[position++];
          }
          if (nextWord === "not") {
            this.tokens.push({ type: "NOT_EQUAL", value: "is not" });
          } else {
            this.tokens.push({ type: "EQUALS", value: "is" });
            position -= nextWord.length; // Backtrack if it was just 'is'
          }
        } else {
          this.tokens.push({ type: TokenType.VAR, value: identifier });
        }
        continue;
      }

      // Try to match operators, keywords
      const pattern = this.findMatchingOperator(input, position);
      if (pattern) {
        this.tokens.push({ type: pattern.type, value: pattern.match });
        position += pattern.length;
        continue;
      }

      position++; // Move to the next character if no token is matched
    }
    return this.tokens;
  }
}
