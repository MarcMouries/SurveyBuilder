import { BooleanNode, NumberNode, StringNode, VariableNode, UnaryExpression, BinaryExpression, Logical } from "./Node";
import { Tokenizer, TokenType } from "./Tokenizer";
import { Logger } from "./Logger";

export class Parser {
  constructor() {}

  parse(input) {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    //console.log("Tokens = ", tokens);
    let current = 0;
    Logger.disableLogging();

    function formatToken(token) {
      if (!token) return "end of input";
      return `${token.type}(${token.value})`;
    }

    const isOperator = (tokenType) => operatorsPrecedence.hasOwnProperty(tokenType);

    const precedence = (operator) => {
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

      operatorsPrecedence[operator] || 0;
    };

    const isAtEnd = () => current >= tokens.length;

    const peek = () => {
      if (isAtEnd()) return null;
      return tokens[current];
    };

    const previous = () => tokens[current - 1];

    const advance = () => {
      if (!isAtEnd()) {
        const fromToken = current > 0 ? previous() : { type: "START", value: "start of input" };
        const toToken = peek();
        Logger.log(`Advance: Next token to process is '${formatToken(toToken)}', moving from '${formatToken(fromToken)}'`);
        current++;
      } else {
        Logger.log(`Advance: At 'end of input', no more tokens to process.`);
      }
      return previous();
    };

    const check = (...expected) => {
      if (isAtEnd()) {
        Logger.log(`Check: Reached 'end of input', cannot match any more tokens.`);
        return false;
      }
      const nextToken = peek();
      const tokenDisplay = formatToken(nextToken);
      let matchFound = false;
      for (const exp of expected) {
        if ((nextToken.type === TokenType.OPERATOR && nextToken.value === exp) || exp === nextToken.type) {
          matchFound = true;
          break;
        }
      }
      Logger.log(`Check completed: Next token ${formatToken(nextToken)} matches expected [${expected.join(", ")}]: ${matchFound ? "YES" : "NO"}`);
      return matchFound;
    };

    const match = (...types) => {
      if (check(...types)) {
        advance();
        Logger.log(`Match: Searching for and consuming next token if it matches any expected: [${types.join(", ")}]`);
        return true;
      }
      Logger.log(`No match found for tokens: ${types.join(", ")}`);
      return false;
    };

    const eat = (tokenType, message) => {
      Logger.log(`Attempting to consume a '${tokenType}' token.`);
      if (check(tokenType)) {
        const token = advance();
        Logger.log(`Success: Consumed '${tokenType}' token with value: '${token.value}'.`);
        return token;
      } else {
        const actualToken = peek(); // Peek at the next token (if any) to report what was actually found
        // Log the failure to consume the expected token, including what was found instead
        Logger.log(`Failure: Expected '${tokenType}', but found '${actualToken ? actualToken.type : "end of input"}'. ${message}`);
        throw new Error(`Error: Expected '${tokenType}', found '${actualToken ? actualToken.type : "end of input"}'. ${message}`);
      }
    };

    const error = (token, message) => {
      const tokenDisplay = formatToken(token);
      throw new Error(`Error at token ${tokenDisplay}: ${message}`);
    };

    const parseNumber = () => {
      Logger.logStart(` Parsing token #${current + 1} of type NUMBER`);
      const token = eat("NUMBER", "expect a number.");
      Logger.logEnd(`Completed parsing token #${current} as NUMBER with value: ${token.value}`);
      return new NumberNode(token.value);
    };

    const parseBoolean = () => {
      Logger.logStart(`Parsing token #${current + 1} of type BOOLEAN`);
      const token = eat("BOOLEAN", "expect a number.");
      Logger.logEnd(`Parsing BOOLEAN at position: ${current}`);
      return new BooleanNode(token.value);
    };

    const parseString = () => {
      Logger.logStart(`Parsing token #${current + 1} of type STRING`);
      const token = eat("STRING", "expect a string.");
      Logger.logEnd(`Parsing STRING token at position: ${current}`);
      return new StringNode(token.value.slice(1, -1)); // Remove quotes
    };

    const parseVariable = () => {
      Logger.log(`Parsing token #${current + 1} of type VARIABLE`);
      const token = eat("VAR", "expect a variable.");
      return new VariableNode(token.value);
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
        const operator = previous().value; // Operator matched by match()
        const right = parseFactor();
        expr = new BinaryExpression(expr, operator, right);
        Logger.log(`Constructed BinaryExpression: ${expr.summarize()}`);
      }
      Logger.logEnd(`Completed parsing term: ${expr.summarize()}`);
      return expr;
    };

    const parseExponent = () => {
      Logger.logStart("Parsing exponentiation operations");

      let base = parseUnary(); // Start with the base which can be a unary operation (e.g., -5)

      // As long as there's an exponent operator, handle the exponentiation with right associativity
      while (match("^")) {
        Logger.log("Found exponentiation operator ^");
        const operator = previous().value; // The operator we just matched
        const exponent = parseExponent(); // Recursively call parseExponent for right associativity
        base = new BinaryExpression(base, operator, exponent);
      }

      Logger.logEnd("Parsed exponentiation operation");
      return base;
    };

    const parseFactor = () => {
      Logger.logStart("Parsing factors for multiplication/division");

      let expr = parseExponent(); // Start with exponentiation to ensure it's evaluated first

      // Handle multiplication and division next, ensuring they're evaluated after exponentiation
      while (match("*", "/")) {
        const operator = previous().value;
        const right = parseExponent(); // Parse the right operand which could itself be an exponentiation
        expr = new BinaryExpression(expr, operator, right);
      }

      Logger.logEnd("Parsed factor");
      return expr;
    };

    const parseUnary = () => {
      while (match("-", "!")) {
        const operator = previous().value;
        const right = parseUnary();
        return new UnaryExpression(operator, right);
      }
      return parsePrimary();
    };

    const parseEquality = () => {
      Logger.logStart(`Parsing equality/non-equality operators between expressions`);
      var expr = parseComparison();
      while (match("=", "!=")) {
        const operator = previous().value;
        const right = parseComparison();
        expr = new BinaryExpression(expr, operator, right);
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
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`parseComparison`);
      return expr;
    };

    return parseEquality();
  }
}

//Testing the improved parser with the expression list
const expression_list = [
  "5",
  "-5",
  // "a",
  // "true",
  // "false",
  // "age",
  // "'toto'",
  // "age is 18",
  // "1 + 2",
  // "a = 1 + 2",
  //"eligible = age > 18",
  //"2*3^2",
  //"weight / height ^ 2",
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
