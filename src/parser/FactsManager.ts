import { ExpressionParser } from "./ExpressionParser";
import { ExpressionEvaluator } from "./ExpressionEvaluator";
import type { Condition, CompoundExpression,  Data, Expression } from "./Expressions";

export class FactsManager {
  facts: Data;
  /* The property used to access the value of a fact
     Default is 'answer'*/
  valueAccessor: string; 

  constructor(facts: Data, valueAccessor: string = 'answer') {
    this.facts = facts;
    this.valueAccessor = valueAccessor;
}


  evaluate(expressionStr: string): boolean {
    // Parse the condition string into a structured condition tree
    const expressionNode: Expression = ExpressionParser.parse(expressionStr);
    // Evaluate the structured condition tree against the stored facts
    return ExpressionEvaluator.evaluate(expressionNode, this.facts);
  }

  update(factKey: string, keyPairValue: any): any {
    //console.log(`Calling FactsManager.update('${factKey}' , ${JSON.stringify(keyPairValue)})`);
    const keys = factKey.split('.');
    let currentLevel = this.facts;

       // Navigate to the correct level in the facts structure
       for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        if (!(key in currentLevel)) {
            currentLevel[key] = {}; // Create intermediate levels as needed
        }
        currentLevel = currentLevel[key];
    }

    const lastKey = keys[keys.length - 1];
    const oldValue = currentLevel[lastKey];

    // If updating a property of an object, merge the new value with the existing object
    if (typeof keyPairValue === 'object' && !Array.isArray(keyPairValue) && typeof currentLevel[lastKey] === 'object' && !Array.isArray(currentLevel[lastKey])) {
        currentLevel[lastKey] = { ...currentLevel[lastKey], ...keyPairValue };
    } else {
        // Directly set the new value for non-object updates or when the target isn't an object
        currentLevel[lastKey] = keyPairValue;
    }

    this.updateReferences();

    return {
      path: factKey,
      oldValue: oldValue,
      newValue: currentLevel[lastKey]
    };}

  insert(newFact: any): void {
    const [factKey, factValue] = Object.entries(newFact)[0];
    this.facts[factKey] = factValue;
    this.updateReferences();
  }

  private resolveFactValue(factPath: string): any {
    const [factKey, attribute] = factPath.split('.');
    if (this.facts[factKey] && attribute) {
      return this.facts[factKey][attribute];
    }
    return null;
  }

  private updateReferences(): void {
    Object.keys(this.facts).forEach(key => {
      const fact = this.facts[key];
      if (fact.title && fact.title.includes("{{") && fact.title.includes("}}")) {
        const matches = fact.title.match(/{{(.*?)}}/);
        if (matches) {
          const dynamicPart = matches[1];
          const dynamicValue = this.resolveFactValue(dynamicPart);
          this.facts[key].title = fact.title.replace(matches[0], dynamicValue ? dynamicValue : "this season");
        }
      }

      // Update visibility based on `visible_when` conditions if present
      if (fact.visible_when) {
        const visibleConditionParts = ExpressionParser.parse(fact.visible_when);
        const isVisible = ExpressionEvaluator.evaluate(visibleConditionParts, this.facts);
        this.facts[key].isVisible = isVisible;
      }
    });
  }
}
