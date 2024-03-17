import { Expression } from "./Node";
import { Parser } from "./Parser";

export class ContextManager {
  constructor() {
    this.context = {};
    this.expressions = []; // Stores expressions to be evaluated
    this.parser = new Parser();
    this.variableToObjectMap = {}; // Maps variables to their corresponding objects
  }

  generateHashForObject(object) {
    // Convert the object to a JSON string and then generate a hash
    // Note: This is a simplistic approach for demonstration. Consider a more robust hashing function for production.
    const jsonString = JSON.stringify(object);
    let hash = 0;

    for (let i = 0; i < jsonString.length; i++) {
      const char = jsonString.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Date.now().toString(36) + Math.random().toString(36).substr(2);

    // return hash.toString();
  }

  addObject(object) {
    const objectHash = this.generateHashForObject(object);
    this.context[objectHash] = object;

    // Log the addition of a new object
    console.log(`CM.addObject(): Adding object with Hash: ${objectHash}`);

    // Update the mapping of variables to this object
    Object.keys(object).forEach((variable) => {
      this.variableToObjectMap[variable] = objectHash;
      console.log(`CM.addObject(): Mapping variable '${variable}' to object '${objectHash}'`);
    });

    // Optionally, evaluate expressions right after adding an object
    // this.evaluateExpressions();
  }

  addExpression(expressionString) {
    const expression = this.parser.parse(expressionString);
    this.expressions.push(expression);

    // Log the addition of a new expression
    console.log(`CM.addExpression(): Adding expression: ${expressionString}`);
  }

  applyExpressionResult(object, expression, result) {
    console.log("CM.evaluateExpressions(): Evaluating expressions");
    console.log("CM.evaluateExpressions(): object    : ", object);
    console.log("CM.evaluateExpressions(): expression: ", expression.summarize());
    console.log("CM.evaluateExpressions(): result    : ", result);

    // Implementation depends on the structure of your expressions and how they specify the target attribute
    if (expression.targetAttribute && result !== undefined) {
      object[expression.targetAttribute] = result;
      console.log(`CM.applyExpressionResult(): Updated '${expression.targetAttribute}' to '${result}'`);
    }
  }

  evaluateExpressions() {
    console.log("CM.evaluateExpressions(): Evaluating expressions");

    this.expressions.forEach((expression) => {
      Object.keys(this.context).forEach((objectId) => {
        const object = this.context[objectId];
        console.log(`CM.evaluateExpressions(): object= '${objectId}'`, object);

        // Evaluate the expression with the current object as context
        const result = expression.evaluate(object);
        this.applyExpressionResult(object, expression, result);
      });
    });

    // Reflect updates to the original objects
    this.reflectUpdates();
  }

  reflectUpdates() {
    console.log("CM.reflectUpdates(): Reflecting expression evaluation results back to objects");

    // Iterate over context to update original objects
    Object.entries(this.variableToObjectMap).forEach(([variable, objectId]) => {
      const object = this.context[objectId];
      console.log(`CM.reflectUpdates(): Updating object '${objectId}' with new values for '${variable}'`);
    });
  }
}

//const expressionString = "{{person.eligible}} = person.age > 18";
const expressionString = "{{person.age}} > 18";
const contextManager = new ContextManager();
let person_John = { person: { name: "John", age: 25, eligible: null } };
let question_Adult = { question_Adult: { 
    label = "Question for Adult person",
    visible_when: "{{person.age}} > 18" } 
};
contextManager.addObject(person_John);
contextManager.addObject(question_Adult);

//let person_Jane = { person: { name: "Jane", age: 18, eligible: null } };
contextManager.addExpression(expressionString);
contextManager.addObject(person_John);
//contextManager.addObject(person_Jane);
contextManager.evaluateExpressions();
console.log("person_John", person_John); // person's eligible should be TRUE because the expression 'eligible = age > 18' should have been evaluated to true.
//console.log("person_Jane", person_Jane); // person's eligible should be FALSE because the expression 'eligible = age > 18' should have been evaluated to false.
