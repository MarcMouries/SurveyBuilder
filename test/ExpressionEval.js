import { Expression } from '../src/engine/Node';
import { BinaryExpression } from '../src/engine/Node';
import { NumberNode } from '../src/engine/Node';
import { VariableNode } from '../src/engine/Node';


let context = { "age": 20, "Person": { "age": 22 } };

// Direct comparison of a simple variable
let expression = new BinaryExpression(new VariableNode('age'), '>', new NumberNode(18));
console.log(expression.evaluate(context)); // true

// Comparison using a nested property
let complexExpression = new BinaryExpression(new VariableNode('Person.age'), '>', new NumberNode(18));
console.log(complexExpression.evaluate(context)); // true
