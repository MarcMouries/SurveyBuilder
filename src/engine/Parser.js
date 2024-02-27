import { NumberNode, StringNode, Constant, Variable, Between, Addition, Multiplication, Equality, GreaterThan, LogicalAnd, LessThan } from "./Node";

export class Parser {
  constructor() {

    const precedence = {
      "OR": 1,
      "AND": 2,
      "EQUALS": 3,
      "!=": 3,
      "<": 4, ">": 4,
      "<=": 4, ">=": 4,
      "+": 5, "-": 5,
      "*": 6, "/": 6,
      "^": 7,
    };

    this.tokens = [
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

  parse(input) {
    //input = input.toLowerCase();
    let position = 0;
    let length = input.length;
    let debug = false;

    const getNextToken = () => {
      if (position >= length) return { type: "EOF", value: "" };
      for (const [regex, type] of this.tokens) {
        const match = input.substring(position).match(regex);
        if (match) {
          const tokenValue = match[0];
          position += tokenValue.length;
          if (type === null) continue; // Skip whitespace
          if (debug) console.log(` =>Token Matched: ${tokenValue.trim()}, Type=${type}`);
          return { type, value: tokenValue.trim() };
        }
      }
      throw new Error("Syntax error at position " + position);
    };

    function eat(tokenType) {
      if (lookahead.type === tokenType) {
        const token = lookahead;
        lookahead = getNextToken(); // Advance to next token
        //console.log(` => EatingToken : lookahead.type=${lookahead.type} , Expected tokenType=${tokenType}`);
        return token;
      } else {
        throw new Error(`Expected token type ${tokenType}, but found ${lookahead.type}`);
      }
    }

    function parseTerm() {
      // Parses multiplication/division
      let left = parseFactor();
      while (lookahead.type === "*" || lookahead.type === "/") {
        const op = lookahead.type;
        eat(op);
        let right = parseFactor();
        left = op === "*" ? new Multiplication(left, right) : new Division(left, right); // Assume Division is implemented
      }
      return left;
    }

    function parseArithmeticExpression() {
      // Parses addition/subtraction
      let left = parseTerm();
      while (lookahead.type === "+" || lookahead.type === "-") {
        const op = lookahead.type;
        eat(op);
        let right = parseTerm();
        left = op === "+" ? new Addition(left, right) : new Subtraction(left, right); // Assume Subtraction is implemented
      }
      return left;
    }

    function parseExpression() {
      if (lookahead.type === "EOF") {
        throw new Error("Unexpected end of input");
      }

      switch (lookahead.type) {
        case "NUMBER":
          const numberToken = eat("NUMBER");
          return new NumberNode(numberToken.value);
        case "STRING":
          const stringToken = eat("STRING");
          return new StringNode(stringToken.value.slice(1, -1)); // Remove quotes
        case "VAR":
          const identToken = eat("VAR");
          return new Variable(identToken.value);
        default:
          throw new Error(`Unexpected token: ${JSON.stringify(lookahead)}`);
      }
    }

    function parseBinaryExpression() {
      let left = parseExpression();

      while (lookahead.type !== "EOF" && ["+", "-", "*", "/", ">", "<", "EQUALS", "AND", "IS BETWEEN"].includes(lookahead.type)) {
        const op = lookahead.type;

        if (op === "IS BETWEEN") {
          // Direct handling for "IS BETWEEN" as one token
          eat("IS BETWEEN");
          let middle = parseExpression();
          if (lookahead.type !== "AND") {
            throw new Error("Expected 'AND' after 'IS BETWEEN'");
          }
          eat("AND"); // Consume the 'AND'
          let right = parseExpression();
          left = new Between(left, middle, right);
        } else {
          // Consume the operator
          eat(op);
          let right;

          // For handling "=" and "is" as equality, depending on your language's semantics
          if (op === "EQUALS") {
            right = parseExpression();
            left = new Equality(left, right);
          } else if (["+", "-", "*", "/"].includes(op)) {
            // Assuming other binary operations follow immediately
            right = parseExpression();
            // Map the operator to the correct class
            switch (op) {
              case "+":
                left = new Addition(left, right);
                break;
              case "-":
                // Implement Subtraction class if exists
                break;
              case "*":
                left = new Multiplication(left, right);
                break;
              case "/":
                // Implement Division class if exists
                break;
            }
          } else if (op === "AND") {
            // Handle logical AND operation
            right = parseBinaryExpression(); // This allows for chaining AND operations
            left = new LogicalAnd(left, right);
          } else {
            // Handle other comparisons like ">", "<"
            right = parseExpression();
            switch (op) {
              case ">":
                left = new GreaterThan(left, right);
                break;
              case "<":
                left = new LessThan(left, right);
                break;
              // Include cases for ">=", "<=", and potentially "==" if used for equality
            }
          }
        }
      }

      return left;
    }

    let lookahead = getNextToken();
    return parseBinaryExpression().toJSON();;
  }
}

//Testing the improved parser with the expression list
const expression_list = [
    "age",
    "18",
    "MAJORITY_AGE",
  //  "'toto'",
  //  "age > 18",
  // "age = MAJORITY_AGE",
  // "age is MAJORITY_AGE",
  //  "age > BABY_AGE and age < TODDLER_AGE",
  //  "age is between TODDLER_AGE and MAJORITY_AGE",
 // "a + b * c = 200",
  // //"a + b * c ="
];

expression_list.forEach((expression) => {

  console.log(`Parsing of expression: '${expression}'`);
  const parser = new Parser();
  const result = parser.parse(expression);
  console.log(`results in the AST: '${JSON.stringify(result, null, 2)}'`);
});
