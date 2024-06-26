import { ArrayLiteral, BooleanNode, NumberNode, StringNode, Identifier,
  AssignmentExpression, BinaryExpression, GroupExpression, 
  LogicalExpression, MemberExpression, UnaryExpression} from "./ast/ASTNode";
import { Tokenizer } from "./Tokenizer";
import { Token } from "./Token";
import { Logger } from "./Logger";

export class Parser {
  constructor() { }

  parse(input) {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    let current = 0;
    Logger.disableLogging();
    //console.log(tokens);

    function formatToken(token) {
      if (!token) return "end of input";
      return `${token.type}(${token.value})`;
    }

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
      let matchFound = expected.includes(nextToken.type) || expected.includes(nextToken.value);

      //Logger.log(`Does Next token ${formatToken(nextToken)} match [${expected.join(", ")}]: ${matchFound ? "YES" : "NO"}`);

      return matchFound;
    };

    const match = (...types) => {
      if (check(...types)) {
        Logger.log(`Match(): Matched  [${types.join(", ")}] -  and advanced to the next token`);
        advance();
        return true;
      }
      Logger.log(`Match(): No match found for tokens: '${types.join(", ")}'`);
      return false;
    };

    const consume = (tokenType, message) => {
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

    const parseNumber = (token) => {
      Logger.logStart(`parseNumber: token #${current} of type NUMBER with value: ${token.value}`);
      // const token = consume("NUMBER", "expect a number.");
      //const token = previous(); // We've already matched and consumed the NUMBER token
      Logger.logEnd(`Completed parsing token #${current} as NUMBER with value: ${token.value}`);
      return new NumberNode(token.value);
    };

    const parseBoolean = (token) => {
      Logger.logStart(`Parsing : token #${current} of type BOOLEAN with value: ${token.value}`);
      //const token = consume("BOOLEAN", "expect a number.");
      Logger.logEnd(`Parsing BOOLEAN at position: ${current}`);
      return new BooleanNode(token.value);
    };

    const parseString = (token) => {
      Logger.logStart(`parseString: token #${current} of type STRING with value: ${token.value}`);
      //const token = consume("STRING", "expect a string.");
      Logger.logEnd(`Parsing STRING token at position: ${current}`);
      return new StringNode(token.value);
    };

    const parseIdentifier = (token) => {
      Logger.logStart(`parseIdentifier: token #${current} of type IDENTIFIER with value: ${token.value}`);
      //const token = consume("IDENTIFIER", "expect a Identifier.");
      Logger.logEnd(`Parsing IDENTIFIER token at position: ${current}`);
      return new Identifier(token.value);
    };

    function parseGroup() {
      Logger.logStart(`Parsing GROUP at position: ${current}`);
      //consume("LPAREN", "Expect '(' to start group.");
      let expr = parseExpression();
      if (expr === null) {
        throw new Error("Expect expression within parentheses.");
      }
      consume("RPAREN", "Expect ')' after expression.");
      Logger.log(`Parsing GROUP: expression = '${JSON.stringify(expr, null, 2)}'`);
      Logger.logEnd(`Parsing GROUP at position: ${current}`);

      return new GroupExpression(expr);
    }

    const parseLogicalOr = () => {
      let expr = parseLogicalAnd();

      while (match(Token.OR)) {
        const operator = Token.OR;
        const right = parseLogicalAnd();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    };

    const parseLogicalAnd = () => {
      let expr = parseEquality(); // Start from equality as it has higher precedence

      while (match(Token.AND)) {
        const operator = Token.AND;
        const right = parseEquality();
        expr = new LogicalExpression(expr, operator, right);
      }
      return expr;
    };

    const parsePrimary = () => {
      Logger.logStart(`parsePrimary`);
      let result = null;
      if (match(Token.NUMBER)) result = parseNumber(previous());
      else if (match(Token.STRING)) result = parseString(previous());
      else if (match(Token.BOOLEAN)) result = parseBoolean(previous());
      else if (match(Token.LPAREN)) result = parseGroup();
      else if (match(Token.LBRACKET)) result = parseArrayLiteral();
      else if (match(Token.IDENTIFIER)) 
        result = parseIdentifier(previous());
        while (match(".")) {
          consume(Token.IDENTIFIER, "Expect property name after '.'.");
          const property = previous();
//          const property = consume(TokenType.IDENTIFIER, "Expect property name after '.'.");
          result = new MemberExpression(result, new Identifier(property.value));
        }
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
        if (right === null) {
          throw new Error(`Missing expression after '${operator}' ` );
          // at ${equals.line}:${equals.column}`);
        }
        expr = new BinaryExpression(expr, operator, right);
        //Logger.log(`Constructed BinaryExpression: ${expr.summarize()}`);
      }
      Logger.logEnd(`Completed parsing term`);
      return expr;
    };

    const parseExponent = () => {
      Logger.logStart("Parsing exponentiation operations");

      let base = parseUnary(); // Start with the base which can be a unary operation (e.g., -5)

      // As long as there's an exponent operator, handle the exponentiation with right associativity
      while (match("^")) {
        Logger.log("Found exponentiation operator ^");
        const operator = previous().value;
        const exponent = parseExponent(); // Recursively call parseExponent for right associativity
        if (exponent === null) {
          throw new Error(`Missing exponent after '${operator}'`);
          // at ${equals.line}:${equals.column}`);
        }
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
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
          // at ${equals.line}:${equals.column}`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }

      Logger.logEnd("Parsed factor");
      return expr;
    };

    const parseUnary = () => {
      Logger.logStart("Parsing Unary");
      while (match("-", "!")) {
        const operator = previous().value;
        const right = parseUnary();
        return new UnaryExpression(operator, right);
      }
      Logger.logEnd("Parsed Unary");
      return parsePrimary();
    };

    const parseArrayLiteral = () => {
      const elements = [];
      if (!check(Token.RBRACKET)) { // If the next token is not ']', we have elements to parse.
        do {
          const element = parseExpression(); // Use parseExpression to handle all types of elements.
          elements.push(element);
        } while (match(Token.COMMA)); // Support comma-separated values.
      }
      consume(Token.RBRACKET, "Expect ']' after array elements.");
      return new ArrayLiteral(elements);
    };

    const parseEquality = () => {
      Logger.logStart(`Parsing equality/non-equality operators between expressions`);
      var expr = parseComparison();
      while (match("==", "!=")) {
        const operator = previous().value;
        const right = parseComparison();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
          // at ${equals.line}:${equals.column}`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`parseEquality`);

      return expr;
    };

    const parseAssignment = () => {
      Logger.logStart(`parseAssignment`);
      let expr = parseLogicalOr(); // Start with logical OR precedence

      if (match("=")) {
        const equals = previous();
        const value = parseAssignment(); // Recursive call to handle chain assignments
        if (value === null) {
          throw new Error(`Missing expression after '='`);
          // at ${equals.line}:${equals.column}`);
        }
        if (expr instanceof Identifier) {
          return new AssignmentExpression(expr, value);
        }
        if (expr instanceof MemberExpression) {
          return new AssignmentExpression(expr, value);
        }
        error(equals, "Invalid assignment target.");
      }
      Logger.logEnd(`parseAssignment`);
      return expr;
    }


    const parseExpression = () => {
      Logger.logStart(`parseExpression: '${input}'`);
      const result = parseAssignment();
      Logger.logEnd(`parseExpression`);
      return result;
    };


    const parseComparison = () => {
      Logger.logStart(`Parsing comparison operators between expressions`);
      var expr = parseTerm();
      while (match(">", ">=", "<", "<=", "contains", "in")) {
        const operator = previous().value;
        const right = parseTerm();
        if (right === null) {
          throw new Error(`Missing expression after '${operator}'`);
        }
        expr = new BinaryExpression(expr, operator, right);
      }
      Logger.logEnd(`parseComparison`);
      return expr;
    };

    return parseExpression();
  }
}
