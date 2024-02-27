import { NumberNode, StringNode, Constant, Variable, Between, Addition, Multiplication, Equality, GreaterThan, LogicalAnd, LessThan } from "./Node";
import { Tokenizer} from "./Tokenizer";


export class Parser {
  constructor() {
    
  }
  parse(input) {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    //let tokens = new Tokenizer((input);
    //console.log("TOKENS: ", tokens);
    let current = 0;
    let position = 0;
    this.length = tokens.length;
    let debug = false;

    const isOperator = (tokenType) => {
      const operators = ["+", "-", "*", "/", ">", "<", "EQUALS", "AND", "OR", "NOT", "IS BETWEEN"];
      return operators.includes(tokenType);
    };


    const isAtEnd = () => current >= tokens.length || peek().type === "EOF";

    const peek = () => tokens[current];

    const previous = () => tokens[current - 1];

    const advance = () => {
      if (!isAtEnd()) {
          current++;
      }
      return previous();
  };

    const check = (type) => {
      if (debug) console.log(` => CHECK: compares type = '${type}' with peek().type = '${peek().type}'`);
      return !isAtEnd() && peek().type === type;
    }

    const eat = (tokenType, message) => {
        if (debug) console.log(` => Eating : peek.type=${peek().type} , Expected tokenType=${tokenType}`);
        if (check(tokenType)) return advance();
        throw error(peek(), message);
    };

    const error = (token, message) => {
        throw new Error(` error: :  token '${token.value}' of type ${token.type} ${message}`);
    };

    const getPrecedence = ((operator) => {
      const precedence = {
        OR: 1,
        AND: 2,
        EQUALS: 3,   "!=": 3,
        "<": 4,      ">": 4,
        "<=": 4,     ">=": 4,
        "+": 5,      "-": 5,
        "*": 6,      "/": 6,
        "^": 7,
      };
      return precedence[operator] || -1;
    });

    // Example of NUD functions for numbers, strings, and variables
    function parseNumber() {
      const token = eat("NUMBER", 'expect a number.')
      return new NumberNode(token.value);
    }

    function parseString() {
      const token = eat("STRING", 'expect a string.')
      return new StringNode(token.value.slice(1, -1)); // Remove quotes
    }


    function parseVariable() {
      if (debug) console.log(` => parseVariable : `);

      const token = eat("VAR", 'expect a variable.')
      return new Variable(token.value);
    }

    // Handling parentheses as a special case for NUD
    function parseGroup() {
      this.eat("(");
      let expr = parseExpression();
      this.eat(")");
      return expr;
    }

    function parsePrimary(precedence = 0) {
      let token = peek();
     // if (debug) console.log(` => parsePrimary:  token '${token.value}' of type ${token.type}`);

      switch (token.type) {
        case "NUMBER":
          return parseNumber();
        case "STRING":
          return parseString();
        case "VAR":
          return parseVariable();
        case "(":
          return parseGroup();
        default:
          throw new Error(`Unexpected token: ${JSON.stringify(lookahead)}`);
      }
    }

    function parseBinaryExpression() {
      let left = parsePrimary();

      while (peek().type !== "EOF" && isOperator(peek().type)) {
        const op = peek().type;

        if (op === "IS BETWEEN") {
          // Direct handling for "IS BETWEEN" as one token
          eat("IS BETWEEN");
          let middle = parsePrimary();
          if (peek().type !== "AND") {
            throw new Error("Expected 'AND' after 'IS BETWEEN'");
          }
          eat("AND"); // Consume the 'AND'
          let right = parsePrimary();
          left = new Between(left, middle, right);
        } else {
          // Consume the operator
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
            left = new LogicalAnd(left, right);
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

      return left;
    }

    //let lookahead = peek();
    return parseBinaryExpression().toJSON();
  }
}

//Testing the improved parser with the expression list
const expression_list = [
   "2",
   "age",
   "'toto'",
   "age > 18",
   "2 + 2 * 4",
   "MAJORITY_AGE",
    "age = MAJORITY_AGE",
  //  "age is MAJORITY_AGE",
  // "age > BABY_AGE and age < TODDLER_AGE",
  // "(age > BABY_AGE) and (age < TODDLER_AGE)",
  // "age is between TODDLER_AGE and MAJORITY_AGE",
  // "a + b * c = 200",
  //"a = ",
  //"a + b * c ="
];

expression_list.forEach((expression) => {
  console.log(`Parsing of expression: '${expression}'`);
  const parser = new Parser();
  const result = parser.parse(expression);
  console.log(`results in the AST: '${JSON.stringify(result, null, 2)}'`);
});
