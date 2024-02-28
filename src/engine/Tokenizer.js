export class Tokenizer {
  constructor() {
    this.tokenPatterns = [
      [/^\s+/, null], // Whitespace, no token type
      [/^\bis between\b/, "IS BETWEEN"], // IS BETWEEN
      [/^is/, "EQUALS"], // Equality
      [/^==/, "EQUALS"], // Equality
      [/^=/, "EQUALS"], // Equality
      [/^!=/, "NOT_EQUAL"], // Inequality
      [/^is not/, "NOT_EQUAL"], // Inequality

      [/^\band\b/, "AND"], // Logical AND
      [/^\bor\b/, "OR"], // Logical OR
      [/^\bnot\b/, "NOT"], // Logical NOT
      [/^-?\d+(?:\.\d+)?/, "NUMBER"], // Decimal numbers
      [/^\btrue\b|\bfalse\b/, "BOOLEAN"],
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
          const tokenValueMatched = match[0]; // Store the matched string before any conversion
          let tokenValue;

          switch (type) {
            case "NUMBER":
              tokenValue = Number(tokenValueMatched);
              break;
            case "BOOLEAN":
              tokenValue = tokenValueMatched === "true";
              break;
            default:
              tokenValue = tokenValueMatched;
          }

          if (type !== null) {
            tokens.push({ type, value: tokenValue });
          }
          position += tokenValueMatched.length;
          matched = true;
          break; // Break the for-loop since we've found a match
        }
      }

      if (!matched) {
        throw new Error(`Syntax error at position ${position} of input '${input}'`);
      }
    }
    return tokens;
  }
}
