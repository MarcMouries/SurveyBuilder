import { Parser } from '../src/engine/Parser'; 

test("Parse simple variable 'age'", () => {
  const result = Parser.parse("age");
  const expected = {
    type: "Variable",
    name: "age"
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse constant '18'", () => {
  const result = Parser.parse("18");
  const expected = {
    type: "Constant",
    value: "18"
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse binary expression 'age > 18'", () => {
  const result = Parser.parse("age > 18");
  const expected = {
    type: "GreaterThan",
    operator: ">",
    left: {
      type: "Variable",
      name: "age"
    },
    right: {
      type: "Constant",
      value: "18"
    }
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse equality 'age is MAJORITY_AGE'", () => {
  const result = Parser.parse("age is MAJORITY_AGE");
  const expected = {
    type: "Equality",
    operator: "=",
    left: {
      type: "Variable",
      name: "age"
    },
    right: {
      type: "Variable",
      name: "MAJORITY_AGE"
    }
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse logical and 'age > BABY_AGE and age < TODDLER_AGE'", () => {
  const result = Parser.parse("age > BABY_AGE and age < TODDLER_AGE");
  const expected = {
    type: "LogicalAnd",
    operator: "and",
    left: {
      type: "GreaterThan",
      operator: ">",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Variable",
        name: "BABY_AGE"
      }
    },
    right: {
      type: "LessThan",
      operator: "<",
      left: {
        type: "Variable",
        name: "age"
      },
      right: {
        type: "Variable",
        name: "TODDLER_AGE"
      }
    }
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse between 'age is between TODDLER_AGE and MAJORITY_AGE'", () => {
  const result = Parser.parse("age is between TODDLER_AGE and MAJORITY_AGE");
  const expected = {
    type: "Between",
    operator: "between",
    left: {
      type: "Variable",
      name: "age"
    },
    middle: {
      type: "Variable",
      name: "TODDLER_AGE"
    },
    right: {
      type: "Variable",
      name: "MAJORITY_AGE"
    }
  };
  expect(JSON.stringify(result)).toBe(JSON.stringify(expected));
});

test("Parse complex expression with addition, multiplication, and equality", () => {
  // Expression to be parsed
  const expression = "a + b * c = 200";

  // Parsing the expression
  const ast = Parser.parse(expression);

  // Expected AST structure
  const expected = {
    "type": "Equality",
    "operator": "=",
    "left": {
      "type": "Addition",
      "operator": "+",
      "left": {
        "type": "Variable",
        "name": "a"
      },
      "right": {
        "type": "Multiplication",
        "operator": "*",
        "left": {
          "type": "Variable",
          "name": "b"
        },
        "right": {
          "type": "Variable",
          "name": "c"
        }
      }
    },
    "right": {
      "type": "Constant",
      "value": "200"
    }
  };

  // Assertions to verify the parsed AST matches the expected structure
  expect(ast).toEqual(expected);
});
