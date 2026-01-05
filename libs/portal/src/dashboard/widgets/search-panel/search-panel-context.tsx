import React, { createContext, useContext } from "react";
import {QueryExpression, SearchModel} from "@portal/query/query-model";

export interface SearchPanelContextValue {
  searchModel: SearchModel;
  predefinedQuery?: QueryExpression | null;
  onConfigChange?: (config: {
    searchModel: SearchModel;
    predefinedQuery?: QueryExpression | null;
  }) => void;
}

export const SearchPanelContext = createContext<SearchPanelContextValue | null>(null);

export function useSearchPanelContext() {
  const context = useContext(SearchPanelContext);
  if (!context) {
    throw new Error("useSearchPanelContext must be used within SearchPanelProvider");
  }
  return context;
}

interface SearchPanelProviderProps {
  value: SearchPanelContextValue;
  children: React.ReactNode;
}

export function SearchPanelProvider({ value, children }: SearchPanelProviderProps) {
  return (
    <SearchPanelContext.Provider value={value}>
      {children}
    </SearchPanelContext.Provider>
  );
}
