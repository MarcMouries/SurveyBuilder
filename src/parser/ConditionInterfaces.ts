export enum NodeType {

    /* Represents an operation on a single operand and an operation that applies directly to that operand (e.g., !a, -b). */
        UNARY_EXP = 'UnaryExpression',
    

    /**
     * BINARY_EXP: Represents operations or comparisons between two values or nested expressions.
     * This can include arithmetic operations or logical comparisons (e.g., '=', '>', '<').
     */
    BINARY_EXP = 'BinaryExpression',
    /**
     * IDENTIFIER: Represents direct references to facts or variables.
     * Used to access the value associated with a specific key in the condition data.
     */
    IDENTIFIER = 'Identifier',

    /**
     * LITERAL: Represents static values, including numbers, strings, and booleans.
     * Used for direct value comparisons or as parts of expressions.
     */
    LITERAL = 'Literal',

    /**
     * CONDITION: Represents a basic conditional expression, typically involving
     * a comparison between two nodes (which could be identifiers, literals, or other expressions).
     */
    CONDITION = 'Condition',

    /**
     * COMPOUND: Represents logical groupings of conditions or expressions using AND/OR operators.
     * Allows for the construction of complex logical structures by combining multiple nodes.
     */
    COMPOUND = 'Compound',


}

// Base interface for all nodes
export interface Node {
    type: NodeType;
}

// Can be an IdentifierNode, LiteralNode, or any other Node type
export interface UnaryExpressionNode extends Node {
    type: NodeType.UNARY_EXP;
    operand: Node; 
}


// Interface for identifiers (variable names)
export interface IdentifierNode extends Node {
    type: NodeType.IDENTIFIER;
    name: string; // The variable name
}

// Interface for literals (static values)
export interface LiteralNode extends Node {
    type: NodeType.LITERAL;
    value: string | number | boolean;
}

// Interface for binary expressions (comparisons, arithmetic operations, etc.)
export interface BinaryExpressionNode extends Node {
    type: NodeType.BINARY_EXP;
    left: Node; 
    operator: string;
    right: Node; 
}

export interface CompoundExpression extends Node {
    type: NodeType.COMPOUND;
    operator: 'AND' | 'OR'; 
    conditions: Node[]; 
}

export interface Condition extends Node {
    type: NodeType.CONDITION;
    left: Node; 
    operator: string;
    right: Node; 
}

// The root of a condition tree can be any Node
export type ConditionTree = Node;

// Data
 export interface Data {
     [key: string]: any;
}