import React, { useState } from "react";
import { PropertyEditor } from "../property-editor-metadata";
import { RegisterPropertyEditor } from "../property-editor-registry";

interface GridTemplateEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  propertyName: string;
  propertyMetadata?: any;
}

/**
 * Visual editor for grid-template-columns/rows
 * Shows a list of tracks with +/- buttons
 */
@RegisterPropertyEditor("gridTemplate")
export class GridTemplateEditor extends PropertyEditor<string> {
  render() {
    const { value, onChange, label } = this.props;

    // Parse the template string into individual tracks
    const parseTracks = (template: string): string[] => {
      if (!template) return ["1fr"];
      // Simple parser - splits by spaces but keeps repeat() together
      const parts = template.match(/repeat\([^)]+\)|\S+/g) || ["1fr"];
      return parts;
    };

    const tracks = parseTracks(value || "1fr");

    const updateTracks = (newTracks: string[]) => {
      onChange(newTracks.join(" "));
    };

    const addTrack = () => {
      updateTracks([...tracks, "1fr"]);
    };

    const removeTrack = (index: number) => {
      if (tracks.length > 1) {
        const newTracks = tracks.filter((_, i) => i !== index);
        updateTracks(newTracks);
      }
    };

    const updateTrack = (index: number, newValue: string) => {
      const newTracks = [...tracks];
      newTracks[index] = newValue;
      updateTracks(newTracks);
    };

    return (
      <div style={{ marginBottom: "16px" }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: "600",
            color: "#e0e0e0",
            marginBottom: "8px",
          }}
        >
          {label}
        </label>

        {/* Track List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginBottom: "8px" }}>
          {tracks.map((track, index) => (
            <TrackRow
              key={index}
              value={track}
              onChange={(newValue) => updateTrack(index, newValue)}
              onRemove={() => removeTrack(index)}
              canRemove={tracks.length > 1}
              index={index}
            />
          ))}
        </div>

        {/* Add Button */}
        <button
          onClick={addTrack}
          style={{
            width: "100%",
            padding: "6px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            color: "#e0e0e0",
            fontSize: "11px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#333";
            e.currentTarget.style.borderColor = "#555";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#2a2a2a";
            e.currentTarget.style.borderColor = "#444";
          }}
        >
          + Add Track
        </button>
      </div>
    );
  }
}

interface TrackRowProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  canRemove: boolean;
  index: number;
}

const TrackRow: React.FC<TrackRowProps> = ({ value, onChange, onRemove, canRemove, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  // Common track size presets
  const presets = [
    { label: "Auto", value: "auto" },
    { label: "1fr", value: "1fr" },
    { label: "2fr", value: "2fr" },
    { label: "100px", value: "100px" },
    { label: "Min", value: "min-content" },
    { label: "Max", value: "max-content" },
  ];

  const isPreset = presets.some((p) => p.value === value);

  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        alignItems: "center",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Track Index */}
      <div
        style={{
          width: "20px",
          fontSize: "10px",
          color: "#666",
          textAlign: "center",
        }}
      >
        {index + 1}
      </div>

      {/* Quick Presets */}
      <div style={{ display: "flex", gap: "2px", flex: 1 }}>
        {presets.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onChange(preset.value)}
            style={{
              flex: 1,
              padding: "4px 2px",
              backgroundColor: value === preset.value ? "#4a4a4a" : "#2a2a2a",
              border: "1px solid " + (value === preset.value ? "#666" : "#444"),
              color: value === preset.value ? "#fff" : "#888",
              fontSize: "9px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              if (value !== preset.value) {
                e.currentTarget.style.backgroundColor = "#333";
                e.currentTarget.style.borderColor = "#555";
              }
            }}
            onMouseLeave={(e) => {
              if (value !== preset.value) {
                e.currentTarget.style.backgroundColor = "#2a2a2a";
                e.currentTarget.style.borderColor = "#444";
              }
            }}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Input (if not a preset) */}
      {!isPreset && (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: "60px",
            padding: "4px 6px",
            backgroundColor: "#2a2a2a",
            border: "1px solid #444",
            color: "#e0e0e0",
            fontSize: "10px",
            fontFamily: "monospace",
          }}
        />
      )}

      {/* Remove Button (shows on hover) */}
      {canRemove && (
        <button
          onClick={onRemove}
          style={{
            width: "20px",
            height: "20px",
            padding: 0,
            backgroundColor: "transparent",
            border: "none",
            color: isHovered ? "#e88" : "transparent",
            fontSize: "14px",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "#f44";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = isHovered ? "#e88" : "transparent";
          }}
        >
          ×
        </button>
      )}
    </div>
  );
};
