import { BooleanNode, NumberNode, StringNode, Variable, BinaryOperator, Logical } from "./Node";
import { Tokenizer } from "./Tokenizer";
import { Tokenizer2, TokenType } from "./Tokenizer2";
import { Logger } from "./Logger";

export class Parser {
  constructor() {}

  parse(input) {
    const tokenizer = new Tokenizer2();
    const tokens = tokenizer.parseTokens(input);
    //console.log("Tokens = ", tokens);
    let current = 0;
    //Logger.disableLogging();

    const operatorsPrecedence = {
      OR: 1,
      AND: 2,
      EQUALS: 3,
      "!=": 3,
      "<": 4,
      ">": 4,
      "<=": 4,
      ">=": 4,
      "+": 5,
      "-": 5,
      "*": 6,
      "/": 6,
      "^": 7,
    };

    function formatToken(token) {
      if (token === null) {
        return "end of input";
      }
      const type = token.type;
      const value = token.value;
      return `${type}(${value})`;
    }

    const advance = () => {
      if (!isAtEnd()) {
        const fromToken = current > 0 ? previous() : null; // Use null to represent the start of input
        const fromDisplay = formatToken(fromToken);

        current++;

        const toToken = isAtEnd() ? null : peek(); // Use null to represent the end of input
        const toDisplay = formatToken(toToken);

        Logger.log(`Advance: Moving from token '${fromDisplay}' to next token '${toDisplay}'`);
      }
      return previous();
    };

    const check = (...expected) => {
      if (isAtEnd()) return false;
      const nextToken = peek();
      const tokenDisplay = formatToken(nextToken);
      let matchFound = false;

      for (const exp of expected) {
        if ((nextToken.type === TokenType.OPERATOR && nextToken.value === exp) || exp === nextToken.type) {
          matchFound = true;
          break;
        }
      }

      Logger.log(`Check if next token ${tokenDisplay} is among expected: [${expected.join(", ")}]: ${matchFound ? "YES" : "NO"}`);
      return matchFound;
    };

    const isOperator = (tokenType) => operatorsPrecedence.hasOwnProperty(tokenType);

    const precedence = (operator) => operatorsPrecedence[operator] || -1;

    const isAtEnd = () => current >= tokens.length;

    const peek = () => {
      if (isAtEnd()) return null; // or return a dummy token indicating the end
      return tokens[current];
    };

    const previous = () => tokens[current - 1];

    const match = (...types) => {
      if (check(...types)) {
        advance();
        Logger.log(`Match: Searching for and consuming next token if it matches expected types: [${types.join(", ")}]`);
        return true;
      }
      Logger.log(`No match found for types: ${types.join(", ")}`);
      return false;
    };

    const eat = (tokenType, message) => {
      Logger.log(`Eating tokenType='${tokenType}' peek.type='${peek()?.type}' message='${message}'`);
      if (check(tokenType)) {
        const token = advance();
        Logger.log(`Consume: Expecting '${tokenType}', found '${peek()?.type}', and consuming it if matched.`);
        return token;
      }
      throw error(peek(), message);
    };

    const error = (token, message) => {
      const tokenDisplay = formatToken(token);
      throw new Error(`Error at token ${tokenDisplay}: ${message}`);
    };

    const parseNumber = () => {
      Logger.logStart(`Parsing NUMBER token at position: ${current}`);
      const token = eat("NUMBER", "expect a number.");
      Logger.logEnd(`Parsing NUMBER at position: ${current}`);
      return new NumberNode(token.value);
    };

    const parseBoolean = () => {
      Logger.logStart(`Parsing BOOLEAN token at position: ${current}`);
      const token = eat("BOOLEAN", "expect a number.");
      Logger.logEnd(`Parsing BOOLEAN at position: ${current}`);
      return new BooleanNode(token.value);
    };

    const parseString = () => {
      Logger.logStart(`Parsing STRING token at position: ${current}`);
      const token = eat("STRING", "expect a string.");
      Logger.logEnd(`Parsing STRING token at position: ${current}`);
      return new StringNode(token.value.slice(1, -1)); // Remove quotes
    };

    const parseVariable = () => {
      Logger.log(`Parsing VARIABLE token at position: ${current}`);
      const token = eat("VAR", "expect a variable.");
      return new Variable(token.value);
    };

    function parseGroup() {
      Logger.logStart(`Parsing GRROUP at position: ${current}`);
      this.eat("(");
      let expr = parseExpression();
      this.eat(")");
      Logger.logEnd(`Parsing GRROUP at position: ${current}`);
      return expr;
    }

    const parsePrimary = () => {
      let token = peek();
      let result;

      Logger.logStart(`parsePrimary: token '${token.value}' of type ${token.type}`);

      if (token.type === TokenType.NUMBER) result = parseNumber();
      else if (token.type === TokenType.STRING) result = parseString();
      else if (token.type === TokenType.BOOLEAN) result = parseBoolean();
      else if (token.type === TokenType.VAR) result = parseVariable();
      else if (token.type === TokenType.LPAREN) result = parseGroup();

      Logger.logEnd(`parsePrimary`);
      return result;
    };

    const parseTerm = (left) => {
      Logger.logStart(`Parsing term for potential addition/subtraction operations`);
      var expr = parseFactor();
      while (match("+", "-")) {
        Logger.log(`Matched + or -: ${previous().type}`);
        const operator = previous().value;
        const right = parseFactor();
        expr = new BinaryOperator(expr, operator, right);
      }
      Logger.logEnd(`parseTerm (Result: ${expr.summarize ? expr.summarize() : typeof expr})`);
      return expr;
    };

    const parseFactor = (left) => {
      Logger.logStart(`Parsing factor for potential multiplication/division operations`);

      let expr = parsePrimary();
      Logger.log(`Check for '/', '*': ${peek() && (peek().type === "/" || peek().type === "*") ? `Found '${peek().type}'` : "None found next"}`);
      while (match("/", "*")) {
        Logger.log(`Matched * or /:  ${previous().type}`);
        const operator = previous().value;
        const right = parsePrimary();
        expr = new BinaryOperator(expr, operator, right);
      }
      Logger.logEnd(`ParseFactor (Result: ${expr.summarize ? expr.summarize() : typeof expr})`);
      return expr;
    };

    const parseAddition = (left) => {
      eat("+");
      const token = eat("VAR", "expect a variable.");

      let right = parsePrimary();
      return new BinaryOperator(expr, "+", right);
    };

    const parseMultiplication = (left) => {
      eat("*");
      let right = parsePrimary();
      return new Multiplication(left, right);
    };
    const parseIsBetween = (left) => {
      eat("IS BETWEEN");
      let middle = parsePrimary();
      eat("AND");
      let right = parsePrimary();
      return new isBetweenNode(left, middle, right);
    };

    const parseGreaterThan = (left) => {
      eat(">");
      let right = parsePrimary();
      return new BinaryOperator(expr, ">", right);
    };

    const parseOperator = (left, operator) => {
      Logger.logStart(`Parsing operator: '${operator}' for operation between expressions`);

      switch (operator) {
        case "+":
          return parseAddition(left);
        case "*":
          return parseMultiplication(left);
        case ">":
          return parseGreaterThan(left);
        // Add cases for other operators
        default:
          throw new Error(`Unhandled operator: ${operator}`);
      }
    };
    const parseEquality = () => {
      Logger.logStart(`Parsing equality/non-equality operators between expressions`);
      var expr = parseComparison();
      while (match("=", "!=")) {
        const operator = previous().value;
        const right = parseComparison();
        expr = new BinaryOperator(expr, operator, right);
      }
      Logger.logEnd(`parseEquality`);

      return expr;
    };

    const parseComparison = () => {
      Logger.logStart(`Parsing comparison operators between expressions`);
      var expr = parseTerm();
      while (match(">", ">=", "<", "<=")) {
        const operator = previous().value;
        const right = parseTerm();
        expr = new BinaryOperator(expr, operator, right);
      }
      Logger.logEnd(`parseComparison`);
      return expr;
    };

    function parseBinaryExpression() {
      Logger.logStart(`BINARY Expression:  `); //token '${token.value}' of type ${token.type}`);
      let left = parsePrimary();
      while (peek().type !== "EOF" && isOperator(peek().type)) {
        const op = peek().type;

        if (op === "IS BETWEEN") {
          left = parseIsBetween(left);
        } else {
          eat(op);
          left = parseOperator(left, op);
        }
      }
      Logger.logEnd(`BinaryExpression`);
      return left;
    }

    return parseEquality();
    //return parseBinaryExpression().toJSON();
  }
}

//Testing the improved parser with the expression list
const expression_list = [
  //"Attending_Status.isVisible = true",
  // "18",
  //  "a",
  // "true",
  // "false",
  // "age",
  // "'toto'",
  // "age is 18",
  "1 + 2",
  //"a > b",
  //"a > 18",
  // "10 + 2 * 5",
  // "10 - 2 + 5",
  //  "MAJORITY_AGE",
  //  "age = MAJORITY_AGE",
  //   "age is MAJORITY_AGE",
  //'age is between TODDLER_AGE and MAJORITY_AGE',
  // "(age > BABY_AGE) and (age < TODDLER_AGE)",
  //   "age is between TODDLER_AGE and MAJORITY_AGE",
  // "a + b * c = 200",
  //"a = ",
  //  "a + b * c ="
];

expression_list.forEach((expression) => {
  console.log(`Parsing of expression: '${expression}'`);
  const parser = new Parser();
  const expressionNode = parser.parse(expression);
  console.log(`The AST for the expression: '${expression}' is '${JSON.stringify(expressionNode, null, 2)}'`);
  console.log(`Type of expressionNode: ${expressionNode.constructor.name}`);
});
