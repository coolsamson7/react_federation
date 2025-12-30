import React, { useState, useCallback, useMemo } from "react";
import { SearchPanel } from "../../../libs/portal/src/query/SearchPanel";
import { ChipSearchPanel, SearchConstraint } from "../../../libs/portal/src/query/components/chip-search-panel";
import { SearchModelDefinition, SearchModelWithConstraints } from "../../../libs/portal/src/query/components/search-model-definition";
import { CustomerQueryModel } from "../../../libs/portal/src/query/sample-query-models";
import { QueryExpression, expressionToString, QueryModel, SearchCriterion } from "../../../libs/portal/src/query/query-model";
import { StringConstraint, NumberType, BooleanConstraint, DateConstraint, IntegerType, Type } from "@portal/validation";

/**
 * Sample customer data
 */
const sampleCustomers = [
  {
    customerId: 1,
    customerName: "John Smith",
    country: "USA",
    registrationDate: "2023-01-15",
    active: true,
  },
  {
    customerId: 2,
    customerName: "Jane Doe",
    country: "Canada",
    registrationDate: "2023-03-22",
    active: true,
  },
  {
    customerId: 3,
    customerName: "Bob Johnson",
    country: "USA",
    registrationDate: "2022-11-10",
    active: false,
  },
  {
    customerId: 4,
    customerName: "Alice Williams",
    country: "UK",
    registrationDate: "2023-05-05",
    active: true,
  },
  {
    customerId: 5,
    customerName: "Charlie Brown",
    country: "USA",
    registrationDate: "2023-02-18",
    active: true,
  },
];

/**
 * Sample page demonstrating SearchPanel and ChipSearchPanel with data binding
 */
export default function QuerySearchSample() {
  const [panelMode, setPanelMode] = useState<"traditional" | "chip">("traditional");
  const [searchExpression, setSearchExpression] = useState<QueryExpression | null>(null);
  const [filteredCustomers, setFilteredCustomers] = useState(sampleCustomers);
  
  // Define available types by name
  const typesByName = useMemo(() => ({
    string: new StringConstraint("string"),
    number: new NumberType("number"),
    integer: new IntegerType("integer"),
    boolean: new BooleanConstraint("boolean"),
    date: new DateConstraint("date"),
  }), []);

  const availableTypes = useMemo(() => Object.values(typesByName), [typesByName]);
  
  // Initialize with predefined CustomerQueryModel
  const [queryModel, setQueryModel] = useState<QueryModel>(CustomerQueryModel);
  const [chipConstraints, setChipConstraints] = useState<SearchConstraint[]>([]);
  const [chipCriteria, setChipCriteria] = useState<SearchCriterion[]>(CustomerQueryModel.criteria);
  
  // Initialize search model with CustomerQueryModel data
  const [initialSearchModel] = useState<SearchModelWithConstraints>({
    name: CustomerQueryModel.name,
    criteria: CustomerQueryModel.criteria.map(c => ({
      ...c,
      typeConstraints: [],
    })),
  });

  const handleSearchModelChange = useCallback((model: SearchModelWithConstraints) => {
    // Convert SearchModelWithConstraints to QueryModel format
    const criteria: SearchCriterion[] = model.criteria.map(c => ({
      name: c.name,
      label: c.label || c.name,
      path: c.name,
      type: c.type,
      mandatory: c.mandatory || false,
      visible: true,
      default: false,
      operators: c.operators || [],
    }));
    
    const updatedModel: QueryModel = {
      name: model.name,
      criteria,
      resultColumns: [],
    };
    
    setQueryModel(updatedModel);
    setChipCriteria(criteria);
    setChipConstraints([]);
  }, []);

  const handleSearch = (expression: QueryExpression) => {
    setSearchExpression(expression);

    if (!expression) {
      setFilteredCustomers(sampleCustomers);
      return;
    }

    // Simple client-side filtering based on the expression
    const filtered = sampleCustomers.filter((customer) => {
      return evaluateExpression(expression, customer);
    });

    setFilteredCustomers(filtered);
  };

  // Simple expression evaluator (for demo purposes)
  const evaluateExpression = (expr: QueryExpression, customer: any): boolean => {
    if (expr.type === "literal") {
      const { criterionName, operatorName, operandValues } = expr as any;
      const value = getCustomerValue(customer, criterionName);

      switch (operatorName) {
        case "equals":
          return value == operandValues[0];
        case "notEquals":
          return value != operandValues[0];
        case "contains":
          return String(value).toLowerCase().includes(String(operandValues[0]).toLowerCase());
        case "startsWith":
          return String(value).toLowerCase().startsWith(String(operandValues[0]).toLowerCase());
        case "greaterThan":
          return value > operandValues[0];
        case "lessThan":
          return value < operandValues[0];
        default:
          return true;
      }
    } else if (expr.type === "and") {
      const { subExpressions } = expr as any;
      return subExpressions.every((sub: QueryExpression) => evaluateExpression(sub, customer));
    } else if (expr.type === "or") {
      const { subExpressions } = expr as any;
      return subExpressions.some((sub: QueryExpression) => evaluateExpression(sub, customer));
    }

    return true;
  };

  const getCustomerValue = (customer: any, criterionName: string): any => {
    switch (criterionName) {
      case "customerId":
        return customer.customerId;
      case "customerName":
        return customer.customerName;
      case "country":
        return customer.country;
      case "registrationDate":
        return customer.registrationDate;
      case "active":
        return customer.active;
      default:
        return null;
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        padding: "24px",
        backgroundColor: "#0d0d0d",
        minHeight: "100vh",
      }}
    >
      {/* Header */}
      <div>
        <h1 style={{ margin: 0, fontSize: "32px", fontWeight: 700, color: "#e0e0e0" }}>
          Query Search Panel Sample
        </h1>
        <p style={{ margin: "8px 0 0 0", fontSize: "16px", color: "#888" }}>
          SearchPanel, ChipSearchPanel, and SearchModel definition
        </p>
      </div>

      {/* Search Model Definition Panel - Always Visible */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <h2 style={{ margin: "0 0 16px 0", fontSize: "22px", fontWeight: 600, color: "#4caf50" }}>
          📋 Search Model Definition
        </h2>
        <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#888" }}>
          Define your search model with criteria and constraints:
        </p>
        <SearchModelDefinition availableTypes={availableTypes} onModelChange={handleSearchModelChange} initialModel={initialSearchModel} />
      </div>

      {/* Panel Mode Toggle */}
      <div style={{ display: "flex", gap: "12px", alignItems: "center", paddingTop: "12px", borderTop: "1px solid #333" }}>
        <span style={{ fontSize: "14px", fontWeight: 600, color: "#e0e0e0" }}>Search Panel Mode:</span>
        <button
          onClick={() => setPanelMode("traditional")}
          style={{
            padding: "8px 16px",
            backgroundColor: panelMode === "traditional" ? "#2196f3" : "#333",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          🔍 Traditional
        </button>
        <button
          onClick={() => setPanelMode("chip")}
          style={{
            padding: "8px 16px",
            backgroundColor: panelMode === "chip" ? "#4caf50" : "#333",
            border: "1px solid #444",
            borderRadius: "4px",
            color: "#fff",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          💬 Chip-Based
        </button>
      </div>

      {/* Search Panels - Togglable */}
      {panelMode === "traditional" ? (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <SearchPanel queryModel={queryModel} onSearch={handleSearch} />
        </div>
      ) : (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <ChipSearchPanel criteria={chipCriteria} constraints={chipConstraints} onConstraintsChange={setChipConstraints} onSearch={handleSearch} queryExpression={searchExpression} />
        </div>
      )}

      {/* Search Expression Display */}
      {searchExpression && (
        <div
          style={{
            padding: "16px",
            backgroundColor: "#1a1a1a",
            border: "1px solid #333",
            borderRadius: "8px",
          }}
        >
          <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600, color: "#e0e0e0" }}>
            Search Expression
          </h3>
          <code
            style={{
              display: "block",
              padding: "12px",
              backgroundColor: "#0d0d0d",
              border: "1px solid #333",
              borderRadius: "4px",
              color: "#4caf50",
              fontSize: "14px",
              fontFamily: "monospace",
            }}
          >
            {expressionToString(searchExpression)}
          </code>
        </div>
      )}

      {/* Results Table */}
      <div
        style={{
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px",
            borderBottom: "1px solid #333",
            backgroundColor: "#252525",
          }}
        >
          <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#e0e0e0" }}>
            Results ({filteredCustomers.length} customers)
          </h3>
        </div>

        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#1e1e1e" }}>
              <th style={headerStyle}>ID</th>
              <th style={headerStyle}>Name</th>
              <th style={headerStyle}>Country</th>
              <th style={headerStyle}>Registration Date</th>
              <th style={headerStyle}>Active</th>
            </tr>
          </thead>
          <tbody>
            {filteredCustomers.map((customer, index) => (
              <tr
                key={customer.customerId}
                style={{
                  backgroundColor: index % 2 === 0 ? "#1a1a1a" : "#151515",
                }}
              >
                <td style={cellStyle}>{customer.customerId}</td>
                <td style={cellStyle}>{customer.customerName}</td>
                <td style={cellStyle}>{customer.country}</td>
                <td style={cellStyle}>{customer.registrationDate}</td>
                <td style={cellStyle}>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "4px 12px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      fontWeight: 600,
                      backgroundColor: customer.active ? "#4caf5020" : "#ff6b6b20",
                      color: customer.active ? "#4caf50" : "#ff6b6b",
                    }}
                  >
                    {customer.active ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredCustomers.length === 0 && (
          <div
            style={{
              padding: "48px 24px",
              textAlign: "center",
              color: "#666",
              fontSize: "14px",
            }}
          >
            No customers found matching the search criteria
          </div>
        )}
      </div>

      {/* Data Binding Example */}
      <div
        style={{
          padding: "20px",
          backgroundColor: "#1a1a1a",
          border: "1px solid #333",
          borderRadius: "8px",
        }}
      >
        <h3 style={{ margin: "0 0 16px 0", fontSize: "18px", fontWeight: 600, color: "#e0e0e0" }}>
          Data Binding Example
        </h3>
        <p style={{ margin: "0 0 16px 0", fontSize: "14px", color: "#888" }}>
          Below are text widgets bound to the first customer's data:
        </p>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {filteredCustomers.length > 0 && (
            <>
              <DataBoundText
                label="Customer Name"
                value={filteredCustomers[0].customerName}
                color="#4caf50"
              />
              <DataBoundText label="Country" value={filteredCustomers[0].country} color="#2196f3" />
              <DataBoundText
                label="Registration Date"
                value={filteredCustomers[0].registrationDate}
                color="#ff9800"
              />
              <DataBoundText
                label="Status"
                value={filteredCustomers[0].active ? "Active" : "Inactive"}
                color={filteredCustomers[0].active ? "#4caf50" : "#ff6b6b"}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

const headerStyle: React.CSSProperties = {
  padding: "12px 16px",
  textAlign: "left",
  fontSize: "13px",
  fontWeight: 600,
  color: "#888",
  borderBottom: "1px solid #333",
};

const cellStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "14px",
  color: "#e0e0e0",
  borderBottom: "1px solid #2a2a2a",
};

function DataBoundText({ label, value, color }: { label: string; value: any; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "12px",
        backgroundColor: "#252525",
        border: "1px solid #333",
        borderRadius: "6px",
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#888", minWidth: "150px" }}>{label}:</span>
      <span style={{ fontSize: "14px", fontWeight: 600, color }}>{value}</span>
    </div>
  );
}
