import type { ASTNodeVisitor } from './ASTNodeVisitor';
import type { ArrayLiteral, ASTNode, AssignmentExpression, BinaryExpression, BooleanNode, 
    GroupingExpression, LogicalExpression, MemberExpression, NumberNode, StringNode, 
    UnaryExpression, Identifier} from "./ASTNode";

export class ASTtoJSON implements ASTNodeVisitor {

    visitArrayLiteral(node: ArrayLiteral): any {
        const elements = node.elements.map(element => element.accept(this));
        return {
            type: "ArrayLiteral",
            elements: elements
        };
    }

    visitMemberExpression(node: MemberExpression): any {
        return {
            type: "MemberExpression",
            object: node.object.accept(this),
            property: node.property.accept(this)
        };
    }

    visitAssignmentExpression(node: AssignmentExpression): any {
        return {
            type: "AssignmentExpression",
            left: node.left.accept(this),
            right: node.right.accept(this)
        };
    }

    visitBinaryExpression(node: BinaryExpression): any {
        return {
            type: "BinaryExpression",
            left: node.left.accept(this),
            operator: node.operator,
            right: node.right.accept(this)
        };
    }
    visitBooleanNode(node: BooleanNode): any {
        return { type: "Boolean", value: node.value };
    }
    visitStringNode(node: StringNode): any {
        return { type: "String", value: node.value };
    }

    visitLogicalExpression(node: LogicalExpression): any {
        return {
            type: "LogicalExpression",
            operator: node.operator,
            left: node.left.accept(this),
            right: node.right.accept(this)
        };
    }
    visitNumberNode(node: NumberNode): any {
        return { type: "Number", value: node.value };
    }

    visitGroupingExpression(node: GroupingExpression): any {
        return { type: "GroupExpression", expression: node.expression.accept(this) };

    }

    visitUnaryExpression(node: UnaryExpression): any {
        return {
            type: "UnaryExpression",
            operator: node.operator,
            operand: node.operand.accept(this)
        };
    }
    visitIdentifier(node: Identifier): any {
        return {
            type: "Identifier",
            name: node.name
        };
    }

    static toJson(node: ASTNode): any {
        const converter = new ASTtoJSON();
        const jsonObject = node.accept(converter);
        return jsonObject;
    }
}