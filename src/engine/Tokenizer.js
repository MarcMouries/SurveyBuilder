export const TokenType = {
  NUMBER: "NUMBER",
  STRING: "STRING",
  BOOLEAN: "BOOLEAN",
  VAR: "VAR",
  OPERATOR: "OP",
  EQUALS: "EQUALS",
  NOT_EQUAL : "NOT_EQUAL",
  ASSIGN: "ASSIGN",
  AND: "AND",
  OR: "OR",
  LPAREN: "LPAREN",
  RPAREN: "RPAREN",
};
export class Tokenizer {
  constructor() {

    this.operators = [
      { match: "is between", type: "IS_BETWEEN", length: 10 },
      { match: "is not", type: TokenType.NOT_EQUAL, length: 6, value: "!=" },
      { match: "is ", type: TokenType.EQUALS, length: 3, value: "==" },
      { match: "==", type: TokenType.EQUALS, length: 2, value: "==" },
      { match: "=", type: TokenType.ASSIGN, length: 1 },
      { match: "!=", type: TokenType.NOT_EQUAL, length: 2 },
      { match: "and", type: "AND", length: 3 },
      { match: "or", type: "OR", length: 2 },
      { match: "not", type: "NOT", length: 3 },
      { match: "true", type: "BOOLEAN", length: 4 },
      { match: "false", type: "BOOLEAN", length: 5 },
      { match: "+", type: TokenType.OPERATOR, length: 1 },
      { match: "-", type: TokenType.OPERATOR, length: 1, value : "-" },
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


  // checks that a matched operator or keyword is not just the prefix of a longer identifier 
  // that should be tokenized as a variable. 
  findMatchingOperator(input, position) {
    for (const operator of this.operators) {
        // Check if the input at the current position starts with the operator match
        if (input.startsWith(operator.match, position)) {
            const matchEnd = position + operator.match.length;
            if (matchEnd) {
              return operator;
            }
            // Ensure the operator is not a prefix of a longer identifier or keyword
            const isEndOfPattern = matchEnd >= input.length || !this.isAlphaNumeric(input[matchEnd]);
            if (isEndOfPattern) {
              //console.log(`Operator '${operator.match}' found.`);
                return operator;
            }
        }
    }
    return null; // No operator matched
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
          this.tokens.push({ type: TokenType.STRING, value: stringLiteral, line: line, column: column });
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
        this.tokens.push({ type: TokenType.NUMBER, value: parseFloat(number) , line: line, column: startColumn });
        continue;
      }

      // Try to match operators or keywords
      const operatorOrKeyword = this.findMatchingOperator(input, position);
      if (operatorOrKeyword) {
        if (operatorOrKeyword.match === "true" || operatorOrKeyword.match === "false") {
          this.tokens.push({ type: TokenType.BOOLEAN, value: operatorOrKeyword.match === "true", line: line, column: column });
        } else {
          // Use the 'value' property for operators like "is" and "is not"
          let tokenValue = operatorOrKeyword.value ? operatorOrKeyword.value : operatorOrKeyword.match;
          this.tokens.push({ type: operatorOrKeyword.type, value: tokenValue , line: line, column: column });
        }
        position += operatorOrKeyword.length;
        column += operatorOrKeyword.length;
        continue;
      }

      // Identifiers
      if (this.isAlpha(char)) {
        let identifier = "";
        while (this.isAlphaNumeric(char)) {
          identifier += char;
          position++; column++;
          char = input[position];
        }
        this.tokens.push({ type: TokenType.VAR, value: identifier, line: line, column: column });
        continue;
      }
      position++; column++;
    }
    return this.tokens;
  }
}