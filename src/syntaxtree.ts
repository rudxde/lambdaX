export abstract class Expression {
    abstract eval(): Expression;
    abstract resolveNameConflicts(a: A): A;
    abstract replaceParameter(name: string, expression: Expression): Expression;
    abstract toString(): string;
    runNameConflictResolver(): Expression {
        this.resolveNameConflicts({
            defined: [],
            renames: [],
        });
        return this;
    }
}

export class LambdaFunction extends Expression {
    isYFunction: boolean;
    constructor(
        public parameter: string,
        public value: Expression,
    ) {
        super();
        this.isYFunction = this.parameter.startsWith('Y');
    }
    eval(): Expression {
        if (this.parameter.startsWith('Y')) {
            return new LambdaApplication(this.value, this.value).eval();
        } else {
            const value = this.value.eval();
            return new LambdaFunction(this.parameter, value);
        }
    }
    resolveNameConflicts(a: A): A {
        if (a.defined.indexOf(this.parameter) === -1) {
            const childResult = this.value.resolveNameConflicts({
                renames: [[this.parameter, this.parameter], ...a.renames],
                defined: [this.parameter, ...a.defined],
            });
            childResult.renames = childResult.renames.filter(([from, to]) => to !== this.parameter)
            return childResult;
        } else {
            for (let i = 0; ; i++) {
                if (a.defined.indexOf(this.parameter + '_' + i) !== -1) continue;
                const oldParameter = this.parameter;
                this.parameter = oldParameter + '_' + i;
                const childResult = this.value.resolveNameConflicts({
                    renames: [[oldParameter, this.parameter], ...a.renames],
                    defined: [this.parameter, ...a.defined],
                })
                childResult.renames = childResult.renames.filter(([from, to]) => to !== this.parameter)
                return childResult;
            }
        }
    }
    replaceParameter(name: string, expression: Expression): Expression {
        const value = this.value.replaceParameter(name, expression);
        return new LambdaFunction(this.parameter, value);
    }
    toString() {
        return `λ${this.parameter}.(${this.value})`;
    }
}

export class LambdaApplication extends Expression {
    static counter = 0;
    constructor(
        public left: Expression,
        public right: Expression,
    ) {
        super();
    }
    eval(): Expression {
        // console.log('evalAPP:' + this.toString());
        const rightResult = this.right.eval();
        const leftResult = this.left.eval();
        if (leftResult instanceof LambdaFunction) {
            // if (leftResult.isYFunction) {
                // const newRecursive = new LambdaApplication(this.right, this.right).eval();
                // console.log('new Recursive: ' + newRecursive.toString());
                // return newRecursive;
            // } else {
                const replacedLeft = leftResult.value.replaceParameter(leftResult.parameter, rightResult);
                const result = replacedLeft.eval();
                return result;
            // }
        } else {
            return new LambdaApplication(leftResult, rightResult);
        }
    }
    resolveNameConflicts(a: A): A {
        const b = this.right.resolveNameConflicts(a)
        return this.left.resolveNameConflicts(b);
    }
    replaceParameter(name: string, expression: Expression): Expression {
        const left = this.left.replaceParameter(name, expression);
        const right = this.right.replaceParameter(name, expression);
        return new LambdaApplication(left, right);
    }
    toString() {
        return `(${this.left}) (${this.right})`
    }
}

export class LambdaName extends Expression {
    constructor(
        public name: string
    ) {
        super();
    }
    eval(): Expression {
        return this;
    }
    resolveNameConflicts(a: A): A {
        const rename = a.renames.find(([from, to]) => from === this.name);
        if (rename) {
            this.name = rename[1];
            return a;
        } else if (a.defined.indexOf(this.name) !== -1) {
            for (let i = 0; ; i++) {
                if (a.defined.indexOf(this.name + '_' + i) !== -1) continue;
                const oldName = this.name;
                this.name = oldName + '_' + i;
                return {
                    renames: a.renames,
                    defined: [this.name, ...a.defined],
                };
            }
        } else {
            return { ...a, defined: [this.name, ...a.defined] };
        }
    }
    replaceParameter(name: string, expression: Expression): Expression {
        if (name === this.name) return expression;
        return this;
    }
    toString() {
        return this.name;
    }
}

interface A {
    defined: string[];
    renames: [string, string][];
}