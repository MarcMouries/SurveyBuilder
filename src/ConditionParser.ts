type ComparisonOperator = '=' | '<' | '>';

interface ICondition {
  questionName: string;
  operator: ComparisonOperator;
  value: string | number;
}

/**
 * Simple condition parser.
 * It assumes:
 * 1) questions are in the format "questionName operator value" 
 * 2) conditions are separated by 'And' or 'Or'
 */
export class ConditionParser {
  constructor(private responses: { [key: string]: any }) {}

/** Extract question names from a condition*/ 
public static extractQuestionNamesFromCondition(conditionStr: string): string[] {
  console.log(`extractQuestionNamesFromCondition`);
  console.log(`  - conditionStr : ${conditionStr}`);

  const questionNames: string[] = [];
  // This regex attempts to capture question names more accurately
  // It assumes question names do not contain the operators or the space around them
  // This is a simplistic approach and might need adjustments
  const regex = /([^\s=<>!]+)\s*(=|<=|>=|<|>|!=)/g;

  let match;
  while ((match = regex.exec(conditionStr))) {
      if (match[1] && !questionNames.includes(match[1])) {
          questionNames.push(match[1]);
      }
  }
  console.log(`  - references questions: ${questionNames.join(", ")}`);
  return questionNames;
}



  public evaluateCondition(conditionStr: string): boolean {
    const orConditions = conditionStr.split('Or').map(s => s.trim());

    for (const orCondition of orConditions) {
      const andConditions = orCondition.split('And').map(s => s.trim());
      if (andConditions.every(cond => this.evaluateAndCondition(cond))) {
        return true; // If any 'OR' condition passes, the entire condition is true
      }
    }

    return false; // If none of the 'OR' conditions pass, the entire condition is false
  }

  private evaluateAndCondition(conditionStr: string): boolean {
    const conditions = this.parseConditions(conditionStr);
    return conditions.every(({ questionName, operator, value }) => {
      const answer = this.responses[questionName];
      switch (operator) {
        case '=':
          return answer == value;
        case '<':
          return answer < value;
        case '>':
            return answer > value;
        default:
          throw new Error(`Unsupported operator ${operator}`);
      }
    });
  }

  private parseConditions(conditionStr: string): ICondition[] {
    return conditionStr.split('And').map(condStr => {
      const [questionName, operator, valueStr] = condStr.split(/\s*(=|<)\s*/).map(s => s.trim());
      const value = isNaN(Number(valueStr)) ? valueStr : Number(valueStr);
      return {
        questionName,
        operator: operator as ComparisonOperator,
        value,
      };
    });
  }
}
