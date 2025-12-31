import "reflect-metadata";

import { get, set } from "../../lang/index";
import { StringBuilder } from "../../util/index";
import { Test } from "../test"
import { ValidationContext } from "../validation-context"
import { ValidationError } from "../validation-error"

export interface ConstraintInfo {
    message?: string
}

export const Constraint = (): MethodDecorator => {
    return (target, propertyKey, descriptor) => {
        // Mark the method with metadata
        Reflect.defineMetadata("isFluentConstraint", true, target, propertyKey);
    };
};

class Patch {
  // data

  object: any;
  property: string;

  constructor(object: any, property: string, private evaluate: () => any) {
    this.object = object;
    this.property = property;
  }

  // public

  resolve(): void {
    this.set(this.evaluate());
  }

  // private

  private set(value: any): void {
    this.object[this.property] = value;
  }
}

export type TypeFactory = () => Type<any>;

export class Type<T> {
    // static data

    static cache: { } = {}
    private static factories = new Map<string, TypeFactory>();
    private static patches: Patch[] = [];
    private static timeout = false

    // static methods

    static registerFactory(typeName: string, factory: TypeFactory) {
        this.factories.set(typeName, factory);
    }

    static create(typeName: string, constraints?: Record<string, any>): Type<any> {
        const factory = this.factories.get(typeName);
        if (!factory) {
            throw new Error(`Unknown type: ${typeName}`);
        }

        let instance = factory();

        if ( constraints ) {
            for (const [constraint, value] of Object.entries(constraints)) {
                // @ts-ignore
                if (typeof instance[constraint] !== "function") {
                    throw new Error(`Unknown constraint: ${constraint}`);
                }

                if (value === true) {
                    // @ts-ignore
                    instance[constraint]();
                } else {
                    // @ts-ignore
                    instance[constraint](value);
                }
            } // for
        }

        return instance;
    }

    static register(constraint: Type<any>) {
        set(this.cache, constraint.name!, constraint)

        return this
    }

    static get(type: string): Type<any> | undefined {
        // execute possible pending patches

        this.resolve()

        // is it cached?

        const constraint = get<Type<any>>(this.cache, type)

        return constraint
    }

    /*static valueOf(type: string) : Type<any> {
        const lowLevelType = type.split(" ")[0]
        type = type.substring(lowLevelType.length + 1) // TODO

        return TypeParser.parse(lowLevelType, type)
    }*/

    private static resolve() {
        let patch;
        while ((patch = this.patches.shift()))
            patch.resolve();

        this.timeout = false
    }

 static patch(object: any, property: string, evaluate: () => any) {
        this.patches.push(new Patch(object, property, evaluate))

        if ( !this.timeout) {
            this.timeout = true
            setTimeout(() => {
                this.resolve()
            }, 0)
        }
    }

    // instance data

    tests: Test<T>[] = []
    message?: string

    // protected

    protected constructor(public name?: string) {
        if ( name )
            Type.register(this)
    }

    baseType = "string"

    protected literalType(type: string) {
        this.baseType = type

        this.test({
            type: type,
            name: "type",
            params: {
                type: type,
            },
            break: true,
            check(object: any): boolean {
                return typeof object == type
            },
        })
    }

    // public

    toJSON(): Record<string, any> {
        const constraints: Record<string, any> = {};

        for (const test of this.tests) {
            // skip the literal type check
            if (test.name === "type") continue;

            if (!test.params || Object.keys(test.params).length === 0) {
                constraints[test.name] = true;
            } else if (Object.keys(test.params).length === 1) {
                // unwrap single param (length → 1, in → ["12"])
                constraints[test.name] = Object.values(test.params)[0];
            } else {
                // fallback: keep full params object
                constraints[test.name] = test.params;
            }
        }

        return {
            [this.baseType]: constraints
        };
    }


    validate(object: T) {
        const context = new ValidationContext()
        this.check(object, context)

        if (context.violations.length > 0)
            throw new ValidationError(context.violations)
    }

    isValid(object: T): boolean {
        const context = new ValidationContext()
        this.check(object, context)

        return context.violations.length == 0
    }

    // fluent: not here!

    errorMessage(message: string) : Type<T> {
        this.message = message

        return this
    }

    test(test: Test<T>): Type<T> {
        this.tests.push(test)

        return this
    }

    @Constraint()
    required(): Type<T> {
        const typeTest = this.tests[0]

        typeTest.ignore = false

        return this
    }

    @Constraint()
    optional(): Type<T> {
        const typeTest = this.tests[0]

        typeTest.ignore = true

        return this
    }

    @Constraint()
    nullable(): Type<T> {
        const typeTest = this.tests[0]

        typeTest.ignore = true

        return this
    }

    params4(constraint: string): any | undefined {
        for (const test of this.tests)
            if (test.name === constraint)
                return test.params

        return undefined
    }

    toString() : string {
        const builder = new StringBuilder()

        builder.append(this.baseType).append(" ")

        for ( const test of this.tests) {
            if ( test.name !== "type") {
                builder.append(test.name)

                if ( test.params ) {
                    for ( const key of Object.keys(test.params)) {
                        builder.append(" ")
                        builder.append(key)
                        builder.append("=")
                        builder.append(test.params[key])
                    }
                } // if
            }
        }

        return builder.toString()
    }

    // protected

    check(object: T, context: ValidationContext) {
        for (const test of this.tests) {
            if (!test.check(object)) {
                // remember violation

                if (test.ignore !== true)
                    context.violations.push({
                        type: test.type,
                        name: test.name,
                        params: test.params,
                        path: context.path,
                        value: object,
                        message: test.message,
                    })

                if (test.break === true) return
            }
        }
    }
}
