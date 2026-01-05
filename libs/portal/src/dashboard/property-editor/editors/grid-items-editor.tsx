import React from "react";
import {GridAlignment, GridItem, GridSizeMode} from "@portal/dashboard/widgets/grid-item";
import {RegisterPropertyEditor} from "@portal/dashboard";

interface GridItemsEditorProps {
  propertyName: string;
  label: string;
  value: GridItem[];
  onChange: (value: GridItem[]) => void;
  propertyMetadata?: any;
}

type Orientation = "column" | "row";

@RegisterPropertyEditor("gridItems")
export class GridItemsEditor extends React.Component<GridItemsEditorProps> {
  private handleAddItem = () => {
    const { value, onChange } = this.props;
    const newItems = [...(value || []), new GridItem(GridSizeMode.fr, 1, GridAlignment.start)];
    onChange(newItems);
  };

  private handleRemoveItem = (index: number) => {
    const { value, onChange } = this.props;
    if (value.length <= 1) return; // Keep at least one item
    const newItems = value.filter((_, i) => i !== index);
    onChange(newItems);
  };

  private handleChangeSizeMode = (index: number, sizeMode: GridSizeMode) => {
    const { value, onChange } = this.props;
    const newItems = [...value];
    newItems[index] = new GridItem(sizeMode, newItems[index].size, newItems[index].alignment);
    onChange(newItems);
  };

  private handleChangeSize = (index: number, size: number) => {
    const { value, onChange } = this.props;
    const newItems = [...value];
    newItems[index] = new GridItem(newItems[index].sizeMode, size, newItems[index].alignment);
    onChange(newItems);
  };

  private handleChangeAlignment = (index: number, alignment: GridAlignment) => {
    const { value, onChange } = this.props;
    const newItems = [...value];
    newItems[index] = new GridItem(newItems[index].sizeMode, newItems[index].size, alignment);
    onChange(newItems);
  };

  private getSizeModeIcon = (mode: GridSizeMode, orientation: Orientation): JSX.Element => {
    const size = 14;
    const color = "#888";
    
    switch (mode) {
      case GridSizeMode.auto:
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M8 1l3 3-1.5 1.5L9 5v6l.5-.5L11 12l-3 3-3-3 1.5-1.5L7 11V5l-.5.5L5 4l3-3z"/>
          </svg>
        );
      case GridSizeMode.fr:
        return orientation === "column" ? (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M2 2h12v2H2V2zm0 5h12v2H2V7zm0 5h12v2H2v-2z"/>
          </svg>
        ) : (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M2 2v12h2V2H2zm5 0v12h2V2H7zm5 0v12h2V2h-2z"/>
          </svg>
        );
      case GridSizeMode.px:
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M2 7h12v2H2V7z"/>
            <path d="M7 2v12h2V2H7z"/>
          </svg>
        );
      case GridSizeMode.percent:
        return (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <circle cx="5" cy="5" r="2"/>
            <circle cx="11" cy="11" r="2"/>
            <path d="M3 13L13 3" stroke={color} strokeWidth="2" fill="none"/>
          </svg>
        );
      case GridSizeMode.minmax:
        return orientation === "column" ? (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M1 4h14M1 12h14M3 4v8M13 4v8" stroke={color} strokeWidth="1.5" fill="none"/>
          </svg>
        ) : (
          <svg width={size} height={size} viewBox="0 0 16 16" fill={color}>
            <path d="M4 1v14M12 1v14M4 3h8M4 13h8" stroke={color} strokeWidth="1.5" fill="none"/>
          </svg>
        );
      default:
        return <span>?</span>;
    }
  };

  private getAlignmentIcon = (alignment: GridAlignment, orientation: Orientation): JSX.Element => {
    const size = 20;
    const color = "#e0e0e0";
    const containerColor = "#444";
    
    switch (alignment) {
      case GridAlignment.start:
        return orientation === "column" ? (
          // Columns: align items to top
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="4" width="12" height="4" fill={color} rx="1"/>
          </svg>
        ) : (
          // Rows: align items to left
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="4" width="4" height="12" fill={color} rx="1"/>
          </svg>
        );
      case GridAlignment.center:
        return orientation === "column" ? (
          // Columns: align items to center vertically
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="8" width="12" height="4" fill={color} rx="1"/>
          </svg>
        ) : (
          // Rows: align items to center horizontally
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="8" y="4" width="4" height="12" fill={color} rx="1"/>
          </svg>
        );
      case GridAlignment.end:
        return orientation === "column" ? (
          // Columns: align items to bottom
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="12" width="12" height="4" fill={color} rx="1"/>
          </svg>
        ) : (
          // Rows: align items to right
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="12" y="4" width="4" height="12" fill={color} rx="1"/>
          </svg>
        );
      case GridAlignment.stretch:
        return orientation === "column" ? (
          // Columns: stretch items vertically
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="4" width="12" height="12" fill={color} rx="1"/>
          </svg>
        ) : (
          // Rows: stretch items horizontally
          <svg width={size} height={size} viewBox="0 0 20 20">
            <rect x="1" y="1" width="18" height="18" fill="none" stroke={containerColor} strokeWidth="1.5"/>
            <rect x="4" y="4" width="12" height="12" fill={color} rx="1"/>
          </svg>
        );
      default:
        return <span>?</span>;
    }
  };

  render() {
    const { label, value, propertyName } = this.props;
    const items = value || [];
    
    // Determine orientation from property name (columns vs rows)
    const orientation: Orientation = propertyName.toLowerCase().includes("column") ? "column" : "row";

    return (
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <label style={{ fontSize: 11, fontWeight: 600, color: "#a0a0a0" }}>
            {label}
          </label>
          <button
            onClick={this.handleAddItem}
            style={{
              padding: "2px 8px",
              fontSize: 11,
              backgroundColor: "#4A90E2",
              color: "#fff",
              border: "none",
              borderRadius: 3,
              cursor: "pointer",
            }}
          >
            + Add
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {items.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                backgroundColor: "#0d0d0d",
                borderRadius: 4,
                border: "1px solid #333",
              }}
            >
              {/* Size Mode Dropdown */}
              <select
                value={item.sizeMode}
                onChange={(e) =>
                  this.handleChangeSizeMode(index, e.target.value as GridSizeMode)
                }
                style={{
                  width: 60,
                  padding: "4px",
                  fontSize: 11,
                  backgroundColor: "#1a1a1a",
                  color: "#e0e0e0",
                  border: "1px solid #333",
                  borderRadius: 3,
                  cursor: "pointer",
                  appearance: "none",
                  WebkitAppearance: "none",
                  MozAppearance: "none",
                }}
                title="Size Mode"
              >
                <option value={GridSizeMode.auto}>Auto</option>
                <option value={GridSizeMode.fr}>Fr</option>
                <option value={GridSizeMode.px}>Px</option>
                <option value={GridSizeMode.percent}>%</option>
                <option value={GridSizeMode.minmax}>Min</option>
              </select>

              {/* Size Value Input (hidden for auto) */}
              {item.sizeMode !== GridSizeMode.auto && (
                <input
                  type="number"
                  value={item.size}
                  onChange={(e) =>
                    this.handleChangeSize(index, parseFloat(e.target.value) || 0)
                  }
                  style={{
                    flex: 1,
                    minWidth: 50,
                    padding: "4px 6px",
                    fontSize: 11,
                    backgroundColor: "#1a1a1a",
                    color: "#e0e0e0",
                    border: "1px solid #333",
                    borderRadius: 3,
                    appearance: "none",
                    WebkitAppearance: "none",
                    MozAppearance: "none",
                  }}
                  step={item.sizeMode === GridSizeMode.fr ? 0.1 : 1}
                  min={0}
                />
              )}

              {/* Alignment Button */}
              <button
                onClick={() => {
                  // Cycle through alignments
                  const alignments = [GridAlignment.start, GridAlignment.center, GridAlignment.end, GridAlignment.stretch];
                  const currentIndex = alignments.indexOf(item.alignment);
                  const nextAlignment = alignments[(currentIndex + 1) % alignments.length];
                  this.handleChangeAlignment(index, nextAlignment);
                }}
                style={{
                  width: 28,
                  height: 28,
                  padding: "4px",
                  backgroundColor: "#1a1a1a",
                  border: "1px solid #333",
                  borderRadius: 3,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title={`Alignment: ${item.alignment}`}
              >
                {this.getAlignmentIcon(item.alignment, orientation)}
              </button>

              {/* Delete Button */}
              <button
                onClick={() => this.handleRemoveItem(index)}
                disabled={items.length <= 1}
                style={{
                  padding: "4px 8px",
                  fontSize: 11,
                  backgroundColor: items.length <= 1 ? "#333" : "#d9534f",
                  color: items.length <= 1 ? "#666" : "#fff",
                  border: "none",
                  borderRadius: 3,
                  cursor: items.length <= 1 ? "not-allowed" : "pointer",
                }}
                title="Remove"
              >
                ×
              </button>
            </div>
          ))}
        </div>

        {/* Preview */}
        <div
          style={{
            marginTop: 8,
            padding: "6px 8px",
            fontSize: 10,
            color: "#888",
            backgroundColor: "#0d0d0d",
            borderRadius: 3,
            fontFamily: "monospace",
          }}
        >
          {items.map((item) => item.toCSSValue()).join(" ")}
        </div>
      </div>
    );
  }
}
