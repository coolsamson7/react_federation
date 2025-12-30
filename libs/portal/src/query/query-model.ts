/**
 * TypeScript implementation of Query Model and Expression structures
 * Based on the Java query framework
 */

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
  criterionName: string;
  operatorName: string;
  operandValues: any[];
}

/**
 * Logical query expression that combines multiple expressions
 */
export interface LogicalQueryExpression extends QueryExpression {
  subExpressions: QueryExpression[];
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
  subExpression: QueryExpression;
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

  /** Whether this operator allows passing values to another operator */
  allowOperandValuesPassingOn?: (receiver: SearchOperator) => boolean;

  /** Whether this operator allows adopting values from another operator */
  allowOperandValuesAdoption?: (sender: SearchOperator) => boolean;
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
  type: TypeDescriptor;

  /** Whether this criterion is mandatory */
  mandatory: boolean;

  /** Whether this criterion is the default */
  default: boolean;

  /** Available operators for this criterion */
  operators: SearchOperator[];
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
  type: TypeDescriptor;

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

/**
 * A QueryModel encapsulates all information about searchable criteria,
 * result columns, and query configuration
 */
export interface QueryModel {
  /** Name/identifier of this query model */
  name: string;

  /** Possible search criteria */
  searchCriteria: SearchCriterion[];

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
    criterionName,
    operatorName,
    operandValues,
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
    subExpressions,
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
    subExpressions,
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
    subExpression,
  };
}

/**
 * Convert query expression to string representation
 */
export function expressionToString(expr: QueryExpression): string {
  switch (expr.type) {
    case "literal": {
      const lit = expr as LiteralQueryExpression;
      return `${lit.criterionName} ${lit.operatorName} ${lit.operandValues.join(", ")}`;
    }
    case "and": {
      const and = expr as AndQueryExpression;
      return `(${and.subExpressions.map(expressionToString).join(" AND ")})`;
    }
    case "or": {
      const or = expr as OrQueryExpression;
      return `(${or.subExpressions.map(expressionToString).join(" OR ")})`;
    }
    case "not": {
      const not = expr as NotQueryExpression;
      return `NOT (${expressionToString(not.subExpression)})`;
    }
  }
}

// ============================================================================
// Common Operators
// ============================================================================

export const CommonOperators = {
  // String operators
  EQUALS: { name: "equals", label: "equals", operandCount: 1 } as SearchOperator,
  NOT_EQUALS: { name: "notEquals", label: "not equals", operandCount: 1 } as SearchOperator,
  CONTAINS: { name: "contains", label: "contains", operandCount: 1 } as SearchOperator,
  STARTS_WITH: { name: "startsWith", label: "starts with", operandCount: 1 } as SearchOperator,
  ENDS_WITH: { name: "endsWith", label: "ends with", operandCount: 1 } as SearchOperator,

  // Numeric operators
  GREATER_THAN: { name: "greaterThan", label: ">", operandCount: 1 } as SearchOperator,
  GREATER_THAN_OR_EQUAL: { name: "greaterThanOrEqual", label: ">=", operandCount: 1 } as SearchOperator,
  LESS_THAN: { name: "lessThan", label: "<", operandCount: 1 } as SearchOperator,
  LESS_THAN_OR_EQUAL: { name: "lessThanOrEqual", label: "<=", operandCount: 1 } as SearchOperator,

  // Range operators
  BETWEEN: { name: "between", label: "between", operandCount: 2 } as SearchOperator,

  // Null operators
  IS_NULL: { name: "isNull", label: "is null", operandCount: 0 } as SearchOperator,
  IS_NOT_NULL: { name: "isNotNull", label: "is not null", operandCount: 0 } as SearchOperator,
};

/**
 * Get default operators for a given type
 */
export function getDefaultOperatorsForType(type: TypeDescriptor): SearchOperator[] {
  switch (type) {
    case "string":
      return [
        CommonOperators.EQUALS,
        CommonOperators.NOT_EQUALS,
        CommonOperators.CONTAINS,
        CommonOperators.STARTS_WITH,
        CommonOperators.ENDS_WITH,
        CommonOperators.IS_NULL,
        CommonOperators.IS_NOT_NULL,
      ];
    case "number":
    case "int":
      return [
        CommonOperators.EQUALS,
        CommonOperators.NOT_EQUALS,
        CommonOperators.GREATER_THAN,
        CommonOperators.GREATER_THAN_OR_EQUAL,
        CommonOperators.LESS_THAN,
        CommonOperators.LESS_THAN_OR_EQUAL,
        CommonOperators.BETWEEN,
        CommonOperators.IS_NULL,
        CommonOperators.IS_NOT_NULL,
      ];
    case "date":
      return [
        CommonOperators.EQUALS,
        CommonOperators.NOT_EQUALS,
        CommonOperators.GREATER_THAN,
        CommonOperators.LESS_THAN,
        CommonOperators.BETWEEN,
        CommonOperators.IS_NULL,
        CommonOperators.IS_NOT_NULL,
      ];
    case "boolean":
      return [CommonOperators.EQUALS, CommonOperators.IS_NULL, CommonOperators.IS_NOT_NULL];
    default:
      return [CommonOperators.EQUALS, CommonOperators.NOT_EQUALS];
  }
}
