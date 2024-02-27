const tokens = [
  [/^\s+/, null], // Whitespace, no token type
  [/^-?\d+(?:\.\d+)?/, "NUMBER"], // Decimal numbers
  [/^[a-zA-Z_][a-zA-Z0-9_]*/, "IDENT"], // Identifiers, allowing underscore
  [/^"[^"]*"/, "STRING"], // String literals, allowing empty strings
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
  [/^==/, "=="], // Equality
  [/^!=/, "!="], // Inequality
  [/^\bis between\b/, "IS BETWEEN"], // IS BETWEEN as a single token
  [/^\band\b/, "AND"], // Logical AND
  [/^\bor\b/, "OR"], // Logical OR
  [/^\bnot\b/, "NOT"], // Logical NOT
  [/^=/, "="], // Assignment or equality (context-dependent)
];

export class Tokenizer {
  // List of tokens recognized by the tokenizer
  #tokens;

  // Position in the input string from which it will read to get the next token
  #cursor;

  // String to turn into tokens
  #string;

  constructor(tokens) {
    this.#tokens = tokens;
  }

  read(string) {
    this.#cursor = 0;
    this.#string = string;
  }

  next() {
    // If at end of input, not more tokens to generate
    if (this.#cursor === this.#string.length) {
      return undefined;
    }

    // Find substring beginning at position of cursor
    const str = this.#string.slice(this.#cursor);

    for (const [pattern, type] of this.#tokens) {
      const [match] = pattern.exec(str) || [];

      if (!match) {
        continue;
      }

      this.#cursor += match.length;

      // Skip tokens with null types
      if (type === null) {
        return this.next();
      }

      return { token: match, type };
    }

    // Could not extract any tokens, so throw error
    throw new Error(`Unrecognized input: ${str[0]}`);
  }
}
