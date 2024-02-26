import { Constant, Variable, Between, Addition, Multiplication, Equality, GreaterThan, LogicalAnd, LessThan } from "./Node";

export class Parser {
  static parse(input) {
    let position = 0;
    let length = input.length;

    function parseToken() {
      while (position < length && /\s/.test(input[position])) {
        position++; // Automatically skip whitespace
      }
      let start = position;
      while (position < length && !/\s/.test(input[position]) && !["(", ")"].includes(input[position])) {
        position++;
      }
      return input.substring(start, position);
    }

    function lookahead() {
      let oldPosition = position;
      let token = parseToken();
      position = oldPosition;
      return token;
    }

    function parsePrimaryExpression() {
      if (input[position] === "(") {
        position++; // Skip '('
        let expr = Parser.parse(input.substring(position));
        if (input[position] !== ")") {
          throw new Error("Expected ')'");
        }
        position++; // Skip ')'
        return expr;
      } else {
        let token = parseToken();
        if (!isNaN(parseFloat(token))) {
          return new Constant(token);
        } else {
          return new Variable(token);
        }
      }
    }

    function parseBinaryExpression() {
      let left = parsePrimaryExpression();

      while (position < length) {
        let op = lookahead();
        if (op !== "is" && op !== ">" && op !== "<" && op !== "and") {
          break;
        }

        parseToken(); // Consume operator
        if (op === "is") {
          let next = lookahead();
          if (next === "between") {
            parseToken(); // Consume 'between'
            let middle = parsePrimaryExpression();
            if (parseToken() !== "and") throw new Error("Expected 'and' in 'is between' expression");
            let right = parsePrimaryExpression();
            left = new Between(left, middle, right);
          } else {
            let right = parsePrimaryExpression();
            left = new Equality(left, right);
          }
        } else if (op === ">") {
          let right = parsePrimaryExpression();
          left = new GreaterThan(left, right);
        } else if (op === "<") {
          let right = parsePrimaryExpression();
          left = new LessThan(left, right);
        } else if (op === "and") {
          let right = parseBinaryExpression(); // Recursively parse the right-hand expression of 'and'
          left = new LogicalAnd(left, right);
        }
      }

      return left;
    }

    return parseBinaryExpression();
  }
}

// Testing the improved parser with the expression list
const expression_list = ["age", "18", "age > 18", "age is MAJORITY_AGE", "age > BABY_AGE and age < TODDLER_AGE", "age is between TODDLER_AGE and MAJORITY_AGE", "a + b * c = 200", "a + b * c = "];

expression_list.forEach((expression) => {
  console.log(`Parsing: '${expression}'`);
  const ast = Parser.parse(expression);
  console.log(JSON.stringify(ast, null, 2));
});
