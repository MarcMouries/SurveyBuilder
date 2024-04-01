export class Environment {
    private values = new Map<string, any>();

    public define(name: string, value: any) {
        this.values.set(name, value);
    }
    
    public set(name: string, value: any) {
        this.values.set(name, value);
    }
    
    public get(name: string): any {
        if (this.values.has(name)) {
            return this.values.get(name);
        }
        throw new Error(`Undefined variable name '${name}'`);
    }

    public toString(): string {
        let result = "Environment {";
        if (this.values.size > 0) {
            const entries = Array.from(this.values).map(([key, value]) => 
                `\n    "${key}": ${JSON.stringify(value, null, 4).replace(/\n/g, '\n    ')}`
            );
            result += entries.join(',') + '\n';
        }
        result += "}";
        return result;
    }
}