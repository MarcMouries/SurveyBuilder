import { test, expect } from "bun:test";
import { BooleanNode, BinaryExpression, NumberNode, Identifier } from "../../src/engine/ast/ASTNode";
import { ASTtoString} from "../../src/engine/ast/ASTtoString";
import { ASTtoJSON} from "../../src/engine/ast/ASTtoJSON";
import { Parser} from "../../src/engine/Parser";


test("Evaluate BinaryExpression 'Person.age' > 18", () => {
    console.log("\nEvaluating BinaryExpression using nested property 'Person.age'");
    const expression
       = new BinaryExpression(new Identifier("Person.age"), ">", new NumberNode(18));
    const expressionToString = ASTtoString.toString(expression);
    console.log("ASTtoString.toString : ", expressionToString); 
    const json =  ASTtoJSON.toJson(expression);
    console.log("ASTtoJSON.toString   : ", json); 
 
  });

  test("Test the expression 2*3^2", () => {
   console.log("\nTest the expression  : '2*3^2'");
   const parser = new Parser();
   const expression = parser.parse("2*3^2");
   const expressionToString = ASTtoString.toString(expression);
   console.log("ASTtoString.toString : ", expressionToString); 
   const json =  ASTtoJSON.toJson(expression);
   console.log("ASTtoJSON.toString   : ", json); 


   //expect(result).toBe(18);
 });
 test("Test the expression 2*3^2", () => {
  console.log("\nTest the expression  : '(2 * (3 ^ 2))'");
  const parser = new Parser();
  const expression = parser.parse("(2 * (3 ^ 2))");
  const expressionToString = ASTtoString.toString(expression);
  console.log("ASTtoString.toString : ", expressionToString);
  const json =  ASTtoJSON.toJson(expression);
  console.log("ASTtoJSON.toString   : ", json); 
  //expect(result).toBe(18);
});