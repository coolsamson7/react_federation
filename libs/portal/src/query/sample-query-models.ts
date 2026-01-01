/**
 * Sample query models for testing the search panel widget
 */

import {
  QueryModel,
  SearchCriterion,
  CommonOperators,
  getDefaultOperatorsForType,
} from "./query-model";
import {string, number, integer, boolean as boolType, date} from "@portal/validation";

/**
 * Sample Customer Query Model
 */
export const CustomerQueryModel: QueryModel = {
  name: "CustomerQuery",
  criteria: [
    {
      name: "customerId",
      label: "Customer ID",
      path: "customer.id",
      type: integer("customerId").toJSON(),
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
      type: string("customerName").toJSON(),
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
      type: string("country").toJSON(),
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS, CommonOperators.NOT_EQUALS, CommonOperators.CONTAINS],
    },
    {
      name: "registrationDate",
      label: "Registration Date",
      path: "customer.registrationDate",
      type: date("registrationDate").toJSON(),
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
      type: boolType("active"),
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "customerId",
      label: "ID",
      type: integer("customerId"),
      visible: true,
    },
    {
      name: "customerName",
      label: "Name",
      type: string("customerName"),
      visible: true,
    },
    {
      name: "country",
      label: "Country",
      type: string("country"),
      visible: true,
    },
    {
      name: "registrationDate",
      label: "Registration Date",
      type: date("registrationDate"),
      visible: true,
    },
    {
      name: "active",
      label: "Active",
      type: boolType("active"),
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
  criteria: [
    {
      name: "orderId",
      label: "Order ID",
      path: "order.id",
      type: integer("orderId").toJSON(),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(integer()),
    },
    {
      name: "orderNumber",
      label: "Order Number",
      path: "order.orderNumber",
      type: string("orderNumber").toJSON(),
      mandatory: false,
      default: true,
      operators: getDefaultOperatorsForType(string()),
    },
    {
      name: "orderDate",
      label: "Order Date",
      path: "order.orderDate",
      type: date("orderDate").toJSON(),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(date()),
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      path: "order.totalAmount",
      type: number("totalAmount").toJSON(),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(number()),
    },
    {
      name: "status",
      label: "Status",
      path: "order.status",
      type: string("status").toJSON(),
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS, CommonOperators.NOT_EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "orderId",
      label: "ID",
      type: integer("orderId"),
      visible: true,
    },
    {
      name: "orderNumber",
      label: "Order Number",
      type: string("orderNumber"),
      visible: true,
    },
    {
      name: "orderDate",
      label: "Order Date",
      type: date("orderDate"),
      visible: true,
    },
    {
      name: "totalAmount",
      label: "Total Amount",
      type: number("totalAmount"),
      visible: true,
    },
    {
      name: "status",
      label: "Status",
      type: string("status"),
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
  criteria: [
    {
      name: "productId",
      label: "Product ID",
      path: "product.id",
      type: integer("productId").toJSON(),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(integer()),
    },
    {
      name: "productName",
      label: "Product Name",
      path: "product.name",
      type: string("productName").toJSON(),
      mandatory: false,
      default: true,
      operators: getDefaultOperatorsForType(string()),
    },
    {
      name: "category",
      label: "Category",
      path: "product.category",
      type: string("category").toJSON(),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(string()),
    },
    {
      name: "price",
      label: "Price",
      path: "product.price",
      type: number("price"),
      mandatory: false,
      default: false,
      operators: getDefaultOperatorsForType(number()),
    },
    {
      name: "inStock",
      label: "In Stock",
      path: "product.inStock",
      type: boolType("inStock").toJSON(),
      mandatory: false,
      default: false,
      operators: [CommonOperators.EQUALS],
    },
  ],
  resultColumns: [
    {
      name: "productId",
      label: "ID",
      type: integer("productId"),
      visible: true,
    },
    {
      name: "productName",
      label: "Name",
      type: string("productName"),
      visible: true,
    },
    {
      name: "category",
      label: "Category",
      type: string("category"),
      visible: true,
    },
    {
      name: "price",
      label: "Price",
      type: number("price"),
      visible: true,
    },
    {
      name: "inStock",
      label: "In Stock",
      type: boolType("inStock"),
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
