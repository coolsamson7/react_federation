/**
 * Complete Example: Building a Product Search Interface
 * 
 * Demonstrates how to:
 * 1. Define types with queryExpression
 * 2. Create a search model with type queryExpression
 * 3. Use ChipSearchPanel for searching
 *

import React, { useState } from "react";
import { string, number, date } from "@portal/validation";
import { ChipSearchPanel } from "../components";
import { SearchModelDefinition, SearchModelWithConstraints } from "../components";
import { createCriterionFromType } from "../type-search-builder";
import { QueryExpression } from "../query-model";

/**
 * Example: Product Search Model
 *
export function ProductSearchExample() {
  // 1. Define types with queryExpression
  const productNameType = string("productName")
    .min(2)
    .max(100)
    .nonEmpty();

  const categoryType = string("category")
    .min(1)
    .max(50);

  const priceType = number("price")
    .min(0)
    .max(1000000);

  const stockType = number("stock")
    .min(0)
    .max(999999);

  const descriptionType = string("description")
    .min(0)
    .max(5000);

  const releaseDateType = date("releaseDate");

  // 2. Create search criteria with types
  const searchCriteria = [
    createCriterionFromType("product_name", "Product Name", productNameType, {
      path: "product.name",
      mandatory: true,
    }),
    createCriterionFromType("category", "Category", categoryType, {
      path: "product.category",
      default: true,
    }),
    createCriterionFromType("price", "Price", priceType, {
      path: "product.price",
    }),
    createCriterionFromType("stock", "Stock Level", stockType, {
      path: "product.stock",
    }),
    createCriterionFromType("description", "Description", descriptionType, {
      path: "product.description",
    }),
    createCriterionFromType("release_date", "Release Date", releaseDateType, {
      path: "product.releaseDate",
    }),
  ];

  // 3. Create search model
  const [searchModel, setSearchModel] = useState<SearchModelWithConstraints>({
    name: "Product Search",
    description: "Search products with advanced type-based queryExpression",
    criteria: searchCriteria,
  });

  // 4. Manage search state
  const [queryExpression, setQueryExpression] = useState<QueryExpression | null[]>([]);
  const [isDefining, setIsDefining] = useState(false);

  const handleSearch = () => {
    console.log("Search queryExpression:", queryExpression);
    // Execute search with queryExpression
  };

  return (
    <div style={{ display: "flex", gap: "20px", padding: "20px" }}>
      {/* Left Panel: Model Definition (optional) *}
      {isDefining && (
        <div style={{ flex: 1 }}>
          <SearchModelDefinition
            availableTypes={[
              productNameType,
              categoryType,
              priceType,
              stockType,
              descriptionType,
              releaseDateType,
            ]}
            onModelChange={setSearchModel}
          />
        </div>
      )}

      {/* Right Panel: Search *}
      <div style={{ flex: 1 }}>
        <h2 style={{ marginTop: 0 }}>Product Search</h2>

        <ChipSearchPanel
          criteria={searchModel.criteria}
          queryExpression={queryExpression}
          onQueryExpressionChange={setQueryExpression}
          onSearch={handleSearch}
          logicalOperator="and"
        />

        {/* Results area would go here *}
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            backgroundColor: "#f5f5f5",
            borderRadius: "6px",
            minHeight: "200px",
          }}
        >
          <h3>Search Results</h3>
          {queryExpression.length === 0 ? (
            <p style={{ color: "#999" }}>Add search queryExpression to see results</p>
          ) : (
            <pre style={{ fontSize: "12px" }}>
              {JSON.stringify(queryExpression, null, 2)}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Example: User Search Model
 * 
 * Demonstrates:
 * - Email validation
 * - Age range queryExpression
 * - Name format queryExpression
 *
export function UserSearchExample() {
  const nameType = string("name")
    .min(2)
    .max(50)
    .matches(/^[a-zA-Z\s'-]+$/); // Only letters, spaces, hyphens, apostrophes

  const emailType = string("email")
    .email();

  const ageType = number("age")
    .min(0)
    .max(150);

  const countryType = string("country")
    .length(2); // ISO country codes

  const [queryExpression, setQueryExpression] = useState<QueryExpression | null[]>([]);

  const searchCriteria = [
    createCriterionFromType("name", "Full Name", nameType, {
      path: "user.name",
      mandatory: true,
    }),
    createCriterionFromType("email", "Email Address", emailType, {
      path: "user.email",
      default: true,
    }),
    createCriterionFromType("age", "Age", ageType, {
      path: "user.age",
    }),
    createCriterionFromType("country", "Country", countryType, {
      path: "user.address.country",
    }),
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "800px" }}>
      <h1>User Search</h1>
      <ChipSearchPanel
        criteria={searchCriteria}
        queryExpression={queryExpression}
        onQueryExpressionChange={setQueryExpression}
        onSearch={() => console.log("Search executed", queryExpression)}
        logicalOperator="and"
      />
    </div>
  );
}

/**
 * Example: Advanced Search with Custom Operators
 *
export function AdvancedSearchExample() {
  const titleType = string("title")
    .min(1)
    .max(200);

  const dateType = date("date");

  const statusType = string("status");
    // Could add: .oneOf("draft", "published", "archived")

  const [queryExpression, setQueryExpression] = useState<QueryExpression | null[]>([]);
  const [logicalOperator, setLogicalOperator] = useState<"and" | "or">("and");

  const searchCriteria = [
    createCriterionFromType("title", "Title", titleType),
    createCriterionFromType("date", "Date", dateType),
    createCriterionFromType("status", "Status", statusType),
  ];

  return (
    <div style={{ padding: "20px", maxWidth: "1000px" }}>
      <h1>Advanced Search</h1>

      <div style={{ marginBottom: "12px" }}>
        <label style={{ marginRight: "12px" }}>
          <input
            type="radio"
            name="logicalOp"
            value="and"
            checked={logicalOperator === "and"}
            onChange={(e) => setLogicalOperator(e.target.value as "and" | "or")}
          />
          AND (all conditions must match)
        </label>
        <label>
          <input
            type="radio"
            name="logicalOp"
            value="or"
            checked={logicalOperator === "or"}
            onChange={(e) => setLogicalOperator(e.target.value as "and" | "or")}
          />
          OR (any condition can match)
        </label>
      </div>

      <ChipSearchPanel
        criteria={searchCriteria}
        queryExpression={queryExpression}
        onQueryExpressionChange={setQueryExpression}
        onSearch={() => console.log(`Executing ${logicalOperator} search`, queryExpression)}
        logicalOperator={logicalOperator}
      />
    </div>
  );
}

export default ProductSearchExample;
*/