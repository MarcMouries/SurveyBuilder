export class Node {
    type: string | undefined;
    name: string | undefined
}



export class VariableNode extends Node {
    constructor(public name: string) {
        super();
        this.type = 'Variable';
    }
}

export class Literal extends Node {
    constructor(public value: string | number | boolean) {
        super();
        this.type = 'Literal';
    }
}
export class NumberNode extends Node {
    constructor(public value: number) {
        super();
        this.type = 'Number';
    }
    _toJSON() {
        return {
            "Number": { value: this.value }
        }
    }
}

export class BinaryExpression extends Node {
    constructor(public operator: string, public left: Node, public right: Node) {
        super();
        this.type = 'BinaryExpression';
    }
}

export class LogicalExpression extends Node {
    constructor(public operator: string, public left: Node, public right: Node) {
        super();
        this.type = 'LogicalExpression';
    }
}