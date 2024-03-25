export class Environment {
    private values = new Map<string, any>();

    set(name: string, value: any) {
        this.values.set(name, value);
    }
    get(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        throw new Error(`Undefined variable name '${name}'`);
    }
}