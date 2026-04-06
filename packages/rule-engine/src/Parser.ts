import {
  ArrayLiteral, BooleanNode, NumberNode, StringNode, Identifier,
  AssignmentExpression, BinaryExpression, GroupExpression,
  IndexExpression, LogicalExpression, MemberExpression, UnaryExpression, CallExpression,
  type ASTNode,
} from './ast/ASTNode';
import { Tokenizer } from './Tokenizer';
import { Token } from './Token';
import type { TokenObj } from './Token';
import { Logger } from './Logger';
import { ParseError } from './errors';

export class Parser {
  parse(input: string): ASTNode {
    const tokenizer = new Tokenizer();
    const tokens = tokenizer.parseTokens(input);
    let current = 0;
    Logger.disableLogging();

    const formatToken = (token: TokenObj | null): string =>
      token ? `${token.type}(${token.value})` : "end of input";

    const isAtEnd = (): boolean => current >= tokens.length;
    const peek = (): TokenObj | null => isAtEnd() ? null : tokens[current];
    const previous = (): TokenObj => tokens[current - 1];

    const advance = (): TokenObj => {
      if (!isAtEnd()) current++;
      return previous();
    };

    const check = (...expected: string[]): boolean => {
      if (isAtEnd()) return false;
      const next = peek()!;
      return expected.includes(next.type) || expected.includes(next.value as string);
    };

    const match = (...types: string[]): boolean => {
      if (check(...types)) { advance(); return true; }
      return false;
    };

    const consume = (tokenType: string, message: string): TokenObj => {
      if (check(tokenType)) return advance();
      const actual = peek();
      throw new ParseError(
        `Expected '${tokenType}', found '${actual ? actual.type : "end of input"}'. ${message}`,
        actual?.line ?? 0,
        actual?.column ?? 0,
      );
    };

    const error = (_token: TokenObj | null, message: string): never => {
      throw new ParseError(message);
    };

    // ── Parsers ──────────────────────────────────────────────────────────────

    const parseArrayLiteral = (): ArrayLiteral => {
      const elements: ASTNode[] = [];
      if (!check(Token.RBRACKET)) {
        do { elements.push(parseExpression()); } while (match(Token.COMMA));
      }
      consume(Token.RBRACKET, "Expect ']' after array elements.");
      return new ArrayLiteral(elements);
    };

    const parsePrimary = (): ASTNode => {
      if (match(Token.NUMBER)) return new NumberNode(previous().value as number);
      if (match(Token.STRING)) return new StringNode(previous().value as string);
      if (match(Token.BOOLEAN)) return new BooleanNode(previous().value as boolean);

      // Unit suffix: 0.3ss → BinaryExpression(0.3, *, Identifier("ss"))
      if (match(Token.UNIT_SUFFIX)) {
        const tok = previous();
        return new BinaryExpression(
          new NumberNode(tok.value as number),
          '*',
          new Identifier(tok.suffix!),
        );
      }

      if (match(Token.LPAREN)) {
        const expr = parseExpression();
        consume(Token.RPAREN, "Expect ')' after expression.");
        return new GroupExpression(expr);
      }

      if (match(Token.LBRACKET)) return parseArrayLiteral();

      if (match(Token.IDENTIFIER)) {
        const name = previous().value as string;
        const id = new Identifier(name);

        // Function call: identifier(args…)
        if (match(Token.LPAREN)) {
          const args: ASTNode[] = [];
          if (!check(Token.RPAREN)) {
            do { args.push(parseExpression()); } while (match(Token.COMMA));
          }
          consume(Token.RPAREN, "Expect ')' after function arguments.");
          return new CallExpression(id, args);
        }

        // Postfix chains: member access (a.b) and index access (a[i]), interleaved
        let result: ASTNode = id;
        for (;;) {
          if (match(".")) {
            consume(Token.IDENTIFIER, "Expect property name after '.'.");
            result = new MemberExpression(result, new Identifier(previous().value as string));
          } else if (match(Token.LBRACKET)) {
            const index = parseExpression();
            consume(Token.RBRACKET, "Expect ']' after index expression.");
            result = new IndexExpression(result, index);
          } else {
            break;
          }
        }
        return result;
      }

      error(peek(), `Unexpected token: ${formatToken(peek())}`);
    };

    const parseUnary = (): ASTNode => {
      if (match("-", "!")) {
        const op = previous().value as string;
        return new UnaryExpression(op, parseUnary());
      }
      return parsePrimary();
    };

    const parseExponent = (): ASTNode => {
      let base = parseUnary();
      while (match("^")) {
        const op = previous().value as string;
        base = new BinaryExpression(base, op, parseExponent()); // right-assoc
      }
      return base;
    };

    const parseFactor = (): ASTNode => {
      let expr = parseExponent();
      while (match("*", "/")) {
        const op = previous().value as string;
        expr = new BinaryExpression(expr, op, parseExponent());
      }
      return expr;
    };

    const parseTerm = (): ASTNode => {
      let expr = parseFactor();
      while (match("+", "-")) {
        const op = previous().value as string;
        expr = new BinaryExpression(expr, op, parseFactor());
      }
      return expr;
    };

    const parseComparison = (): ASTNode => {
      let expr = parseTerm();
      while (match(">", ">=", "<", "<=", "contains", "in")) {
        const op = previous().value as string;
        expr = new BinaryExpression(expr, op, parseTerm());
      }
      return expr;
    };

    const parseEquality = (): ASTNode => {
      let expr = parseComparison();
      while (match("==", "!=")) {
        const op = previous().value as string;
        expr = new BinaryExpression(expr, op, parseComparison());
      }
      return expr;
    };

    const parseLogicalAnd = (): ASTNode => {
      let expr = parseEquality();
      while (match(Token.AND)) {
        expr = new LogicalExpression(expr, Token.AND, parseEquality());
      }
      return expr;
    };

    const parseLogicalOr = (): ASTNode => {
      let expr = parseLogicalAnd();
      while (match(Token.OR)) {
        expr = new LogicalExpression(expr, Token.OR, parseLogicalAnd());
      }
      return expr;
    };

    const parseAssignment = (): ASTNode => {
      const expr = parseLogicalOr();
      if (match("=")) {
        const value = parseAssignment();
        if (expr instanceof Identifier) return new AssignmentExpression(expr, value);
        if (expr instanceof MemberExpression) return new AssignmentExpression(expr, value);
        error(previous(), "Invalid assignment target.");
      }
      return expr;
    };

    const parseExpression = (): ASTNode => parseAssignment();

    return parseExpression();
  }
}
