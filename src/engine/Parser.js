import { BooleanNode, NumberNode, StringNode, Variable,BinaryOperator, Logical } from "./Node";
import { Tokenizer } from "./Tokenizer";

export class Parser {
  constructor() {}

  parse(input) {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    //let tokens = new Tokenizer((input);
    console.log("TOKENS: ", tokens);
    let current = 0;
    let position = 0;
    this.length = tokens.length;
    let debug = true;
    let depth = 0; // Depth of recursive calls

    const operatorsPrecedence = {
      OR: 1,
      AND: 2,
      EQUALS: 3,      "!=": 3,
      "<": 4,      ">": 4,
      "<=": 4,      ">=": 4,
      "+": 5,      "-": 5,
      "*": 6,      "/": 6,
      "^": 7,
    };

    const isOperator = (tokenType) => operatorsPrecedence.hasOwnProperty(tokenType);
    const precedence = (operator) => operatorsPrecedence[operator] || -1;

    const isAtEnd_OLD = () => current >= tokens.length || peek().type === "EOF";
    const isAtEnd = () => current >= tokens.length;

    const peek_OLD = () => tokens[current];
    const peek = () => {
      if (isAtEnd()) return null; // or return a dummy token indicating the end
      return tokens[current];
    };
    
    const previous = () => tokens[current - 1];

    const advance = () => {
      if (!isAtEnd()) {
        const fromType = current > 0 ? previous().type : "start of input"; // Adjust here
        current++;
        const toType = isAtEnd() ? "end of input" : peek().type;
        log(`\\__ Advance: from '${fromType}' to '${toType}'`);
      }
      return previous();
    };
    
    

    const log = (message) => {
      if (debug) {
        console.log(" ".repeat(depth * 3) + message);
      }
    };

    const check_OLD = (type) => {
      log(`\\__ Check: compares type = '${type}' with peek().type = '${peek().type}'`);
      return !isAtEnd() && peek().type === type;
    };
    const check = (type) => {
      if (isAtEnd()) {
        return false;
      }
      log(`│ ├ Check: compares type = '${type}' with peek().type = '${peek().type}'`);
      return peek().type === type;
    };
    

const match = (...types) => {
  for (const type of types) {
    if (check(type)) {
      advance();
      log(`\\__ Matched type: '${type}'`);
      return true;
    }
  }
  log(`\\__ No match found for types: ${types.join(', ')}`);
  return false;
};



    const eat = (tokenType, message) => {
      log(`\\__ Eating tokenType='${tokenType}' peek.type='${peek().type}' message='${message}'`);
      if (check(tokenType)) {
        const token = advance();
        log(`   └ Consume token: '${token.type}' with value '${token.value}'`);

        return token;
      }
      throw error(peek(), message);
    };

    const error = (token, message) => {
      throw new Error(` error: :  token '${token.value}' of type ${token.type} ${message}`);
    };

    const parseNumber = () => {
      log(`Parsing NUMBER at position: ${current}`);
      //log(`└─ Consume token: 'NUMBER' with value ${token.value}`);

      depth++;
      const token = eat("NUMBER", "expect a number.");
      depth--;
      return new NumberNode(token.value);
    };
    const parseBoolean = () => {
      log(`Parsing BOOLEAN at position: ${current}`);
      depth++;
      const token = eat("BOOLEAN", "expect a number.");
      depth--;
      return new BooleanNode(token.value);
    }
    const parseString = () => {
      log(`Parsing STRING at position: ${current}`);
      depth++;
      const token = eat("STRING", "expect a string.");
      depth--;
      return new StringNode(token.value.slice(1, -1)); // Remove quotes
    }

    const parseVariable = () => {
      log(`Parsing VARIABLE at position: ${current}`);
      const token = eat("VAR", "expect a variable.");
      return new Variable(token.value);
    }

    function parseGroup() {
      log(`Parsing GRROUP at position: ${current}`);

      this.eat("(");
      let expr = parseExpression();
      this.eat(")");
      depth--;

      return expr;
    }

    function parsePrimary(precedence = 0) {
      depth++;
      let token = peek();
      let result;
      log(`=> START parsePrimary:  token '${token.value}' of type ${token.type}`);

      try {
        switch (token.type) {
          case "NUMBER":
            result = parseNumber();
            break; 
          case "STRING":
            result = parseString();
            break;
            case "BOOLEAN":
              result = parseBoolean();
              break;
            
          case "VAR":
            result = parseVariable();
            break;
          case "(":
            result = parseGroup();
            break;
          default:
            throw new Error(`Unexpected token: ${JSON.stringify(lookahead)}`);
        }
      } finally {
        log(`=> END parsePrimary`);
        depth--;
      }
      return result;
    }

    const parseTerm = (left) => {
      log(`┌─ START parseTerm`);
      depth++;

      var expr = parseFactor();
      while (match( "+", "-")) {
        log(`│  ├─ Matched + or -: ${previous().type}`);
        const operator = previous()
        const right = parseFactor()
        expr = new BinaryOperator(expr, operator, right);
      }
      log(`└─ END parseTerm (Result: ${expr.summarize ? expr.summarize() : typeof expr})`);
      depth--;
      return expr
    }
    const parseFactor = (left) => {
      log(`┌─ START parseFactor`);
      depth++;

      let expr = parsePrimary();
      log(`|- Check for '/', '*': ${peek() && (peek().type === '/' || peek().type === '*') ? `Found '${peek().type}'` : 'None found next'}`);

      while (match("/", "*")) {
        log(`│  ├─ Matched * or /:  ${previous().type}`);
        const operator = previous()
        const right = parsePrimary();
        expr = new BinaryOperator(expr, operator, right);
      }
      log(`└─ END parseFactor (Result: ${expr.summarize ? expr.summarize() : typeof expr})`);

      depth--;
      return expr
    }

    const parseAddition = (left) => {
      eat("+");
      const token = eat("VAR", "expect a variable.");

      let right = parsePrimary();
      return new BinaryOperator(expr, '+', right)
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
    }


    const parseGreaterThan = (left) => {
      eat(">");
      let right = parsePrimary();
      return new GreaterThan(left, right);
    };

    const parseOperator = (left, operator) => {
      log(`=> START parseOperator: '${operator}' `);

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
    }
    const parseEquality  = () => {
      log(`┌ START parseEquality`);
      depth++;
      var expr = parseComparison();
      while (match("=", "!=")) {
        const operator = previous()
        const right = comparison()
        expr = new BinaryOperator(expr, operator, right)
      }
      depth--;
      log(`│ └ END parseEquality`);

      return expr
    }

    const parseComparison = () => {
      log(`│ ┌ START parseComparison`);
      depth++;

      var expr = parseTerm();
      while (match(">", ">=", "<", "<=")) {
        const operator = previous()
        const right = parseTerm()
        expr = new BinaryOperator(expr, operator, right)
      }
      depth--;
      log(`│ │ └ END parseComparison`);
      return expr
    }

    function parseBinaryExpression() {
      depth++;
      log(`=> START BINARY Expression:  `); //token '${token.value}' of type ${token.type}`);

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
      depth--;
      log(`END parseBinaryExpression`);
      return left;
    }


    function parseBinaryExpression_OLD() {
      depth++;
      log(`=> START BINARY Expression:  `); //token '${token.value}' of type ${token.type}`);

      let left = parsePrimary();

      while (peek().type !== "EOF" && isOperator(peek().type)) {
        const op = peek().type;

        if (op === "IS BETWEEN") {
          eat("IS BETWEEN");
          let middle = parsePrimary();
          if (peek().type !== "AND") {
            throw new Error("Expected 'AND' after 'IS BETWEEN'");
          }
          eat("AND"); // Consume the 'AND'
          let right = parsePrimary();
          left = new Between(left, middle, right);
        } else {
          eat(op);
          let right;
          if (op === "EQUALS") {
            right = parsePrimary();
            left = new Equality(left, right);
          } else if (["+", "-", "*", "/"].includes(op)) {
            right = parsePrimary();
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
            left = new Logical(left, right);
          } else {
            right = parsePrimary();
            switch (op) {
              case ">":
                left = new GreaterThan(left, right);
                break;
              case "<":
                left = new LessThan(left, right);
                break;
              // Include cases for ">=", "<="
            }
          }
        }
      }
      depth--;
      log(`END parseBinaryExpression`);

      return left;
    }
return parseEquality();
    //return parseBinaryExpression().toJSON();
  }
}



//Testing the improved parser with the expression list
const expression_list = [
  // "1",
  // "a",
  // "true",
  // "false",
  // "age",
  // "'toto'",
  //"1 + 2",
  //"a > b",
   //"a > 18",
  "10 + 2 * 5",
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
  const result = parser.parse(expression);
  console.log(`results in the AST: '${JSON.stringify(result, null, 2)}'`);
});