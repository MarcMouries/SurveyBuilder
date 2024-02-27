
export class Tokenizer {
  constructor() {
    this.tokenPatterns = [
      [/^\s+/, null], // Whitespace, no token type
      [/^\bis between\b/, "IS BETWEEN"], // IS BETWEEN
      [/^is/, "EQUALS"], // Equality
      [/^==/, "EQUALS"], // Equality
      [/^=/, "EQUALS"], // Equality
      [/^\band\b/, "AND"], // Logical AND
      [/^\bor\b/, "OR"], // Logical OR
      [/^\bnot\b/, "NOT"], // Logical NOT
      [/^-?\d+(?:\.\d+)?/, "NUMBER"], // Decimal numbers
      [/^[a-zA-Z_][a-zA-Z0-9_]*/, "VAR"], // Variable Identifiers, allowing underscore
      [/^'([^']*)'/, "STRING"], // String literals enclosed in single quotes
      [/^"([^"]*)"/, "STRING"], // String literals enclosed in double quotes
      [/^\+/, "+"], // Plus operator
      [/^-/, "-"], // Minus operator
      [/^\*/, "*"], // Multiplication operator
      [/^\//, "/"], // Division operator
      [/^\^/, "^"], // Power operator
      [/^\(/, "("], // Open parenthesis
      [/^\)/, ")"], // Close parenthesis
      [/^,/, ","], // Comma
      [/^>/, ">"], // Greater than
      [/^</, "<"], // Less than
      [/^>=/, ">="], // Greater than or equal to
      [/^<=/, "<="], // Less than or equal to
      [/^!=/, "!="], // Inequality
    ];
  }

  parseTokens(input) {
    let tokens = [];
    let position = 0;

    while (position < input.length) {
      let matched = false;

      for (const [regex, type] of this.tokenPatterns) {
        const match = input.substring(position).match(regex);
        if (match) {
          const tokenValue = match[0];
          position += tokenValue.length;
          if (type !== null) {
            // Only add non-whitespace tokens
            tokens.push({ type, value: tokenValue.trim() });
          }
          matched = true;
          break; // Break after the first match
        }
      }

      if (!matched) {
        throw new Error(`Syntax error at position ${position} of input '${input}'`);
      }
    }

    tokens.push({ type: "EOF", value: "" }); // Add an EOF token at the end
    return tokens;
  }
}