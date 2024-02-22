// Define the structure for a basic condition
interface Condition {
    type: 'CONDITION';
    left: string;
    operator: string;
    right: string | number | boolean;
}

// Define the structure for compound expressions using AND/OR
interface CompoundExpression {
    type: 'AND' | 'OR';
    conditions: ExpressionNode[];
}

type ExpressionNode = Condition | CompoundExpression;

export interface ConditionData {
    [key: string]: any;
}

export type ConditionTree = ExpressionNode;


export class ConditionEvaluator {
    static evaluate(conditionTree: ConditionTree, data: ConditionData): boolean {
        // Explicitly handle SimpleCondition and LogicalCondition types
        if (conditionTree.type === 'CONDITION') {
            // Handle simple condition evaluation
            const { left, operator, right } = conditionTree;
            const value = this.resolveDataValue(left, data);
            switch (operator) {
                case "=": return value === right;
                case "!=": return value !== right;
                case "<": return value < right;
                case "<=": return value <= right;
                case ">": return value > right;
                case ">=": return value >= right;
                case "contains": return Array.isArray(value) && value.includes(right);
                default: throw new Error(`Unsupported operator: ${operator}`);
            }
        } else if (conditionTree.type === 'AND' || conditionTree.type === 'OR') {
            // Handle logical conditions (AND/OR)
            const evaluationMethod = conditionTree.type === 'AND' ? 'every' : 'some';
            return conditionTree.conditions[evaluationMethod](cond => this.evaluate(cond, data));
        }
        // Fallback for unrecognized structure
        console.error("Unrecognized condition structure:", conditionTree);
        return false;
    }

    private static resolveDataValue(path: string, data: ConditionData): any {
        const parts = path.split('.');
        let currentValue = data;
        for (let part of parts) {
            if (!(part in currentValue)) {
                console.error(`Path not found in data: ${path}`);
                return undefined; // Ensure a clear failure path
            }
            currentValue = currentValue[part];
        }
        return currentValue;
    }

}
