enum TokenType {
  NUMBER = 'NUMBER',
  IDENTIFIER = 'IDENTIFIER',
  OPERATOR = 'OPERATOR',
  LITERAL = 'LITERAL',
  WHITESPACE = 'WHITESPACE',
}

interface Token {
  type: TokenType;
  value: string;
}

interface AST {
  type: string;
  body: Node[];
}


interface NumberLiteralNode {
  type: 'NumberLiteral';
  value: number;
}

interface IdentifierNode {
  type: 'Identifier';
  name: string;
}
interface IsBetweenExpression {
  type: 'IsBetweenExpression';
  subject: IdentifierNode;
  lowerBound: NumberLiteralNode;
  upperBound: NumberLiteralNode;
}

// Add more node types as necessary

type Node = NumberLiteralNode | IdentifierNode | IsBetweenExpression;


// Extend the tokenizer to handle operators and specific keyword sequences
export function tokenizer(input: string): Token[] {
  let tokens: Token[] = [];
  let current = 0;

  while (current < input.length) {
    let char = input[current];

    if (/\s/.test(char)) {
      current++;
      continue;
    }

    if (/[0-9]/.test(char)) {
      let value = '';
      while (/[0-9]/.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: TokenType.NUMBER, value });
      continue;
    }





    if (/[a-zA-Z]/.test(char)) {
      let value = '';
      while (/[a-zA-Z]/.test(char)) {
        value += char;
        char = input[++current];
      }
      tokens.push({ type: TokenType.IDENTIFIER, value });
      continue;
    }

    const operatorPatterns = [
      { match: "=", length: 1 },
      { match: "!=", length: 2 },
      { match: "<", length: 1 },
      { match: "<=", length: 2 },
      { match: ">", length: 1 },
      { match: ">=", length: 2 },
      { match: "contains", length: 8 },
      { match: "is between", length: 10 }
    ];

    let matchedOperator = operatorPatterns.find(op => input.substr(current, op.length) === op.match);
    if (matchedOperator) {
      tokens.push({ type: TokenType.OPERATOR, value: matchedOperator.match });
      current += matchedOperator.length;
      continue;
    }

    throw new TypeError('Unknown character: ' + char);
  }

  return tokens;
}

function expectNumber(tokens: Token[], current: number): [NumberLiteralNode, number] {
  let token = tokens[current];
  if (token.type !== TokenType.NUMBER) {
    throw new TypeError(`Expected a number, found ${token.type}`);
  }
  let node: NumberLiteralNode = {
    type: 'NumberLiteral',
    // Correctly converting the string value to a number
    value: parseFloat(token.value),
  };
  return [node, current + 1];
}

function expectAnd(tokens: Token[], current: number): number {
  let token = tokens[current];
  if (!(token.type === TokenType.IDENTIFIER && token.value === "and")) {
    throw new TypeError(`Expected "and", found ${token.type}`);
  }
  return current + 1;
}
function expectIdentifier(tokens: Token[], current: number): [IdentifierNode, number] {
  let token = tokens[current];
  if (token.type !== TokenType.IDENTIFIER) {
    throw new TypeError(`Expected an identifier, found ${token.type}`);
  }
  let node: IdentifierNode = {
    type: 'Identifier',
    name: token.value,
  };
  return [node, current + 1];
}

function parseIsBetweenExpression(tokens: Token[], current: number): [IsBetweenExpression, number] {
  current++; // Skip the "is between" operator token

  let [subject, subjectPosition] = expectIdentifier(tokens, current);
  let [lowerBound, lowerBoundPosition] = expectNumber(tokens, subjectPosition);
  let andPosition = expectAnd(tokens, lowerBoundPosition);
  let [upperBound, finalPosition] = expectNumber(tokens, andPosition);

  let node: IsBetweenExpression = {
    type: 'IsBetweenExpression',
    subject,
    lowerBound,
    upperBound,
  };

  return [node, finalPosition];
}

export function parser(tokens: Token[]): AST {
  let current = 0;

  function walk(): Node {
    let token = tokens[current];

    if (token.type === TokenType.NUMBER) {
      current++;
      return {
        type: 'NumberLiteral',
        value: parseFloat(token.value),
      };
    }

    if (token.type === TokenType.IDENTIFIER) {
      current++;
      return {
        type: 'Identifier',
        name: token.value as string,
      };
    }

    if (token.type === TokenType.OPERATOR && token.value?.startsWith("is between")) {
      let [node, newPosition] = parseIsBetweenExpression(tokens, current - 1); // include the subject identifier
      current = newPosition;
      return node;
    }

    throw new TypeError(`Unexpected token type: ${token.type}`);
  }

  let ast: AST = {
    type: 'root',
    body: [],
  };

  while (current < tokens.length) {
    ast.body.push(walk());
  }

  return ast;
}

const input = "Age is between 10 and 30";
const tokens = tokenizer(input);
console.log(JSON.stringify(tokens, null, 2));
const ast = parser(tokens);
console.log(JSON.stringify(ast, null, 2));