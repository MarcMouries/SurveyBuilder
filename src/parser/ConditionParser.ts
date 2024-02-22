import type { Condition, ConditionTree, CompoundExpression } from "./ConditionEvaluator";

export class ConditionParser {
    static parse(condition: string): ConditionTree {
        // Normalize condition to identify logical operators
        const normalizedCondition = condition.replace(/\band\b/gi, 'AND').replace(/\bor\b/gi, 'OR');

        // Entry point for recursive parsing
        return this.parseLogicalOrSimpleCondition(normalizedCondition);
    }

    private static parseLogicalOrSimpleCondition(expression: string): ConditionTree {
        if (expression.includes('AND') || expression.includes('OR')) {
            const type = expression.includes('AND') ? 'AND' : 'OR';
            const splitByType = expression.split(type);
            return {
                type: type,
                conditions: splitByType.map(subExpr => this.parseLogicalOrSimpleCondition(subExpr.trim()))
            } as CompoundExpression;
        } else {
            return this.parseSimpleCondition(expression);
        }
    }

    private static parseSimpleCondition(expression: string): Condition {
        const regex = /(\w+(?:\.\w+)*)\s*(=|!=|<|<=|>|>=|contains)\s*(\d+|true|false|'[^']*'|"[^"]*")/;
        const match = expression.match(regex);
        if (!match) throw new Error(`Invalid condition format: ${expression}`);

        let [, left, operator, rightMatch] = match;

        // Initially assume right is a string, and then check for other types
        let right: string | number | boolean = rightMatch.replace(/^['"]|['"]$/g, ''); // Remove quotes for strings

        // Clean up and type-cast the right-hand value
        if (right === 'true') right = true;
        else if (right === 'false') right = false;
        else if (!isNaN(Number(right))) right = Number(right);

        return { type: 'CONDITION', left, operator, right };
    }
}