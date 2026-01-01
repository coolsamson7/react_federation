/**
 * TypeScript implementation of Query Model and Expression structures
 * Based on the Java query framework
 */
import {Type} from "@portal/validation";

// ============================================================================
// Type Descriptors
// ============================================================================

export type TypeDescriptor = "string" | "number" | "date" | "boolean" | "int";

// ============================================================================
// Query Expression Types
// ============================================================================

/**
 * Base interface for all query expressions
 */
export interface QueryExpression {
  type: "literal" | "and" | "or" | "not";
}

/**
 * A literal query expression represents a single condition:
 * criterion + operator + operand values
 */
export interface LiteralQueryExpression extends QueryExpression {
  type: "literal";
  criterion: string | SearchCriterion;
  operator: string;
  values: any[];
}

/**
 * Logical query expression that combines multiple expressions
 */
export interface LogicalQueryExpression extends QueryExpression {
  values: QueryExpression[];
}

/**
 * AND logical expression
 */
export interface AndQueryExpression extends LogicalQueryExpression {
  type: "and";
}

/**
 * OR logical expression
 */
export interface OrQueryExpression extends LogicalQueryExpression {
  type: "or";
}

/**
 * NOT logical expression
 */
export interface NotQueryExpression extends QueryExpression {
  type: "not";
  value: QueryExpression;
}

// ============================================================================
// Search Operator
// ============================================================================

/**
 * A search operator encapsulates information about an operator and its operands
 */
export interface SearchOperator {
  /** Technical identifier of the operator (e.g., "equals", "contains", "greaterThan") */
  name: string;

  /** Display label for the operator (e.g., "equals", "contains", ">") */
  label: string;

  /** Number of operands required by this operator */
  operandCount: number;
}

export abstract class AbstractSearchOperator implements SearchOperator {
  readonly name: string;
  readonly label: string;
  readonly operandCount: number;

  protected constructor(
    name: string,
    label: string,
    operandCount: number
  ) {
    this.name = name;
    this.label = label;
    this.operandCount = operandCount;
  }
}

// specific classes

export class EQOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new EQOperator();

  private constructor() {
    super("equals", "=", 1);
  }
}

export class NEQOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new NEQOperator();

  private constructor() {
    super("notEquals", "!=", 1);
  }
}

export class LTOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new LTOperator();

  private constructor() {
    super("lt", "<", 1);
  }
}

export class LEQOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new LEQOperator();

  private constructor() {
    super("leq", "<=", 1);
  }
}

export class GTOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new GTOperator();

  private constructor() {
    super("gt", ">", 1);
  }
}

export class GEQOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new GEQOperator();

  private constructor() {
    super("qeq", ">=", 1);
  }
}

export class StartsWithOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new StartsWithOperator();

  private constructor() {
    super("startsWith", "starts with", 1);
  }
}

export class EndsWithOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new EndsWithOperator();

  private constructor() {
    super("endsWith", "ends with", 1);
  }
}

export class ContainsOperator extends AbstractSearchOperator {
  static readonly INSTANCE = new ContainsOperator();

  private constructor() {
    super("contains", "contains", 1);
  }
}


export class OperatorFactory {
  private static instance: OperatorFactory;

  static getInstance(): OperatorFactory {
    if (!this.instance) {
      this.instance = new OperatorFactory();
    }
    return this.instance;
  }

  // ----------------------------------
  // registries
  // ----------------------------------

  /** operators registered for a concrete Type instance */
  private readonly byType = new Map<Type<any>, SearchOperator[]>();

  /** operators registered for a base type ("string", "number", …) */
  readonly byBaseType = new Map<string, SearchOperator[]>();

  /** lookup by operator name ("equals", "lt", …) */
  private readonly byName = new Map<string, SearchOperator>();

  /** fallback */
  private readonly defaultOperators: SearchOperator[] = [];

  private constructor() {
    this.registerDefaults();
  }

  // ----------------------------------
  // internal helpers
  // ----------------------------------

  private autoRegisterNames(operators: SearchOperator[]) {
    for (const op of operators) {
      // first wins (singleton semantics)
      if (!this.byName.has(op.name)) {
        this.byName.set(op.name, op);
      }
    }
  }

  // ----------------------------------
  // defaults
  // ----------------------------------

  private registerDefaults() {
    // string
    this.registerBaseType("string", [
      EQOperator.INSTANCE,
      NEQOperator.INSTANCE,
      StartsWithOperator.INSTANCE,
      EndsWithOperator.INSTANCE,
      ContainsOperator.INSTANCE
    ]);

    // number-like
    const numberOps = [
      EQOperator.INSTANCE,
      NEQOperator.INSTANCE,
      LTOperator.INSTANCE,
      LEQOperator.INSTANCE,
      GTOperator.INSTANCE,
      GEQOperator.INSTANCE
    ];

    this.registerBaseType("number", numberOps);
    this.registerBaseType("integer", numberOps);
    this.registerBaseType("float", numberOps);
    this.registerBaseType("double", numberOps);

    // boolean
    this.registerBaseType("boolean", [
      EQOperator.INSTANCE,
      NEQOperator.INSTANCE
    ]);
  }

  // ----------------------------------
  // registration API
  // ----------------------------------

  /** register operators for a concrete Type */
  registerType(type: Type<any>, operators: SearchOperator[]) {
    this.byType.set(type, operators);
    this.autoRegisterNames(operators);
  }

  /** register operators for a base type */
  registerBaseType(baseType: string, operators: SearchOperator[]) {
    this.byBaseType.set(baseType, operators);
    this.autoRegisterNames(operators);
  }

  // ----------------------------------
  // lookup
  // ----------------------------------

  /** lookup operators by Type (with baseType fallback) */
  getOperators(type: Type<any>): SearchOperator[] {
    const direct = this.byType.get(type);
    if (direct) return direct;

    const base = this.byBaseType.get(type.baseType);
    if (base) return base;

    return this.defaultOperators;
  }

  /** lookup a single operator by name */
  getOperatorByName(name: string): SearchOperator | undefined {
    return this.byName.get(name);
  }

  /** lookup multiple operators by name (preserves order) */
  getOperatorsByName(names: string[]): SearchOperator[] {
    return names
      .map(n => this.byName.get(n))
      .filter((op): op is SearchOperator => op !== undefined);
  }
}



// ============================================================================
// Search Criterion
// ============================================================================

/**
 * A search criterion represents a searchable field with its operators
 */
export interface SearchCriterion {
  /** Technical identifier of the criterion */
  name: string;

  /** Display label for the criterion */
  label: string;

  /** Path notation for generic query engines (e.g., "customer.address.city") */
  path: string;

  /** Business data type of this criterion */
  type: Record<string,any> | Type<any>;

  /** Whether this criterion is mandatory */
  mandatory: boolean;

  /** where it is possible to add this search criterion, or if present visible **/
  visible?: boolean;

  /** Whether this criterion is the default */
  default: boolean;

  /** Available operators for this criterion */
  operators?: string[];
}

// ============================================================================
// Result Column
// ============================================================================

export interface ResultColumn {
  /** Technical identifier of the column */
  name: string;

  /** Display label for the column */
  label: string;

  /** Data type of this column */
  type: Type<any>;

  /** Whether this column is visible by default */
  visible: boolean;
}

// ============================================================================
// Ordering and Grouping
// ============================================================================

export interface OrderingColumn {
  columnName: string;
  direction: "asc" | "desc";
}

export interface GroupingColumn {
  columnName: string;
}

// ============================================================================
// Query Model
// ============================================================================

export interface SearchModel {
  /** Name/identifier of this query model */
  name: string;

  /** Possible search criteria */
  criteria: SearchCriterion[];
}

/**
 * A QueryModel encapsulates all information about searchable criteria,
 * result columns, and query configuration
 */
export interface QueryModel extends SearchModel {
  /** Columns in the query result */
  resultColumns: ResultColumn[];

  /** Grouping columns */
  groupingColumns?: GroupingColumn[];

  /** Ordering columns */
  orderingColumns?: OrderingColumn[];

  /** Whether the query result must not contain duplicates */
  distinct?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Create a literal query expression
 */
export function createLiteralExpression(
  criterionName: string,
  operatorName: string,
  ...operandValues: any[]
): LiteralQueryExpression {
  return {
    type: "literal",
    criterion: criterionName,
    operator: operatorName,
    values: operandValues,
  };
}

/**
 * Create an AND expression
 */
export function createAndExpression(
  ...subExpressions: QueryExpression[]
): AndQueryExpression {
  return {
    type: "and",
    values: subExpressions,
  };
}

/**
 * Create an OR expression
 */
export function createOrExpression(
  ...subExpressions: QueryExpression[]
): OrQueryExpression {
  return {
    type: "or",
    values: subExpressions,
  };
}

/**
 * Create a NOT expression
 */
export function createNotExpression(
  subExpression: QueryExpression
): NotQueryExpression {
  return {
    type: "not",
    value: subExpression,
  };
}

/**
 * Convert query expression to string representation
 */
export function expressionToString(expr: QueryExpression): string {
  switch (expr.type) {
    case "literal": {
      const lit = expr as LiteralQueryExpression;
      return `${lit.criterion} ${lit.operator} ${lit.values.join(", ")}`;
    }
    case "and": {
      const and = expr as AndQueryExpression;
      return `(${and.values.map(expressionToString).join(" AND ")})`;
    }
    case "or": {
      const or = expr as OrQueryExpression;
      return `(${or.values.map(expressionToString).join(" OR ")})`;
    }
    case "not": {
      const not = expr as NotQueryExpression;
      return `NOT (${expressionToString(not.value)})`;
    }
  }
}


/**
 * Get the effective Type instance from a SearchCriterion
 */
export function getEffectiveType(criterion: SearchCriterion): Type<any> | null {
  if (criterion.type instanceof Type) {
    return criterion.type;
  } else {
    // Use Type.create to convert record to instance
    const typeRecord = criterion.type as Record<string, any>;
    const typeName = Object.keys(typeRecord)[0];
    const constraints = typeRecord[typeName];

    try {
      return Type.create(typeName, constraints);
    } catch (error) {
      console.warn(`Failed to create Type instance for ${typeName}:`, error);
      return null;
    }
  }
}

export function getOperatorsForCriterion(criterion: SearchCriterion) : SearchOperator[] {
    if ( criterion.operators)
        return OperatorFactory.getInstance().getOperatorsByName(criterion.operators);
    else
        return getDefaultOperatorsForType(criterion.type)
}
/**
 * Get default operators for a given type
 */
export function getDefaultOperatorsForType(type: Type<any> | Record<string,any> | undefined): SearchOperator[] {
    if (type instanceof Type)
      return OperatorFactory.getInstance().getOperators(type);
    else if (type)
      return OperatorFactory.getInstance().byBaseType.get(Object.keys(type)[0])! ;

     return [];
}
