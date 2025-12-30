/**
 * Sample query models for testing the search panel widget
 */

import {
  QueryModel,
  SearchCriterion,
  CommonOperators,
  getDefaultOperatorsForType,
} from "./query-model";

/**
 * Sample Customer Query Model
 */
export const CustomerQueryModel: QueryModel = {
  name: "CustomerQuery",
  searchCriteria: [
    {
      name: "customerId",
      label: "Customer ID",
      path: "customer.id",
      type: "int",
      mandatory: false,
      default: false,
      operators: [
        CommonOperators.EQUALS,
        CommonOperators.NOT_EQUALS,
        CommonOperators.GREATER_THAN,
        CommonOperators.LESS_THAN,
      ],
    },
    {
      name: "customerName",
      label: "Customer Name",
      path: "customer.name",
      type: "string",
      mandatory: false,
      default: true,
      operators: [
        CommonOperators.EQUALS,
        CommonOperators.CONTAINS,
        CommonOperators.STARTS_WITH,
        CommonOperators.ENDS_WITH,
      ],
    },
    {
      name: "country",
      label: "Country",
      path: "customer.country",
      type: "string",
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS, CommonOperators.NOT_EQUALS, CommonOperators.CONTAINS],
    },
    {
      name: "registrationDate",
      label: "Registration Date",
      path: "customer.registrationDate",
      type: "date",
      mandatory: false,
      default: false,
      operators: [
        CommonOperators.EQUALS,
        CommonOperators.GREATER_THAN,
        CommonOperators.LESS_THAN,
        CommonOperators.BETWEEN,
      ],
    },
    {
      name: "active",
      label: "Active",
      path: "customer.active",
      type: "boolean",
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "customerId",
      label: "ID",
      type: "int",
      visible: true,
    },
    {
      name: "customerName",
      label: "Name",
      type: "string",
      visible: true,
    },
    {
      name: "country",
      label: "Country",
      type: "string",
      visible: true,
    },
    {
      name: "registrationDate",
      label: "Registration Date",
      type: "date",
      visible: true,
    },
    {
      name: "active",
      label: "Active",
      type: "boolean",
      visible: true,
    },
  ],
  orderingColumns: [
    {
      columnName: "customerName",
      direction: "asc",
    },
  ],
  distinct: false,
};

/**
 * Sample Order Query Model
 */
export const OrderQueryModel: QueryModel = {
  name: "OrderQuery",
  searchCriteria: [
    {
      name: "orderId",
      label: "Order ID",
      path: "order.id",
      type: "int",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("int"),
    },
    {
      name: "orderNumber",
      label: "Order Number",
      path: "order.orderNumber",
      type: "string",
      mandatory: false,
      default: true,
      operators: getDefaultOperatorsForType("string"),
    },
    {
      name: "orderDate",
      label: "Order Date",
      path: "order.orderDate",
      type: "date",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("date"),
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      path: "order.totalAmount",
      type: "number",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("number"),
    },
    {
      name: "status",
      label: "Status",
      path: "order.status",
      type: "string",
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS, CommonOperators.NOT_EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "orderId",
      label: "ID",
      type: "int",
      visible: true,
    },
    {
      name: "orderNumber",
      label: "Order Number",
      type: "string",
      visible: true,
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: "date",
      visible: true,
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: "number",
      visible: true,
    },
    {
      name: "status",
      label: "Status",
      type: "string",
      visible: true,
    },
  ],
  orderingColumns: [
    {
      columnName: "orderDate",
      direction: "desc",
    },
  ],
  distinct: false,
};

/**
 * Sample Product Query Model
 */
export const ProductQueryModel: QueryModel = {
  name: "ProductQuery",
  searchCriteria: [
    {
      name: "productId",
      label: "Product ID",
      path: "product.id",
      type: "int",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("int"),
    },
    {
      name: "productName",
      label: "Product Name",
      path: "product.name",
      type: "string",
      mandatory: false,
      default: true,
      operators: getDefaultOperatorsForType("string"),
    },
    {
      name: "category",
      label: "Category",
      path: "product.category",
      type: "string",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("string"),
    },
    {
      name: "price",
      label: "Price",
      path: "product.price",
      type: "number",
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType("number"),
    },
    {
      name: "inStock",
      label: "In Stock",
      path: "product.inStock",
      type: "boolean",
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "productId",
      label: "ID",
      type: "int",
      visible: true,
    },
    {
      name: "productName",
      label: "Name",
      type: "string",
      visible: true,
    },
    {
      name: "category",
      label: "Category",
      type: "string",
      visible: true,
    },
    {
      name: "price",
      label: "Price",
      type: "number",
      visible: true,
    },
    {
      name: "inStock",
      label: "In Stock",
      type: "boolean",
      visible: true,
    },
  ],
  orderingColumns: [
    {
      columnName: "productName",
      direction: "asc",
    },
  ],
  distinct: false,
};
