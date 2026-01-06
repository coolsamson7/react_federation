/**
 * Cube preview generator for JS and YAML output
 * Based on the Python cube_generator.py server-side implementation
 */

import { CubeDescriptor, MeasureDescriptor, DimensionDescriptor, JoinDescriptor, SegmentDescriptor } from './cube-metadata';

// -------------------------
// Helpers
// -------------------------

function jsObject(obj: Record<string, any>, indent: number = 2): string {
    const space = " ".repeat(indent);
    const lines = ["{"];
    
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            continue;
        }
        
        if (typeof value === "string") {
            lines.push(`${space}${key}: \`${value}\`,`);
        } else if (typeof value === "boolean") {
            lines.push(`${space}${key}: ${value},`);
        } else if (Array.isArray(value)) {
            lines.push(`${space}${key}: ${JSON.stringify(value)},`);
        } else {
            lines.push(`${space}${key}: ${value},`);
        }
    }
    
    lines.push("}");
    return lines.join("\n");
}

// -------------------------
// JS generator
// -------------------------

export function generateCubeJs(cube: CubeDescriptor): string {
    const lines = [`cube(\`${cube.name}\`, {`];
    const indent = "  ";

    // SQL
    if (cube.sql) {
        lines.push(`${indent}sql: \`${cube.sql}\`,`);
    } else {
        lines.push(`${indent}sql: \`SELECT * FROM ${cube.table}\`,`);
    }

    // Measures
    if (cube.measures && cube.measures.length > 0) {
        lines.push(`${indent}measures: {`);
        for (const m of cube.measures) {
            const body: Record<string, any> = {
                type: m.type,
                sql: m.expression || m.column,
                title: m.title,
                description: m.description,
            };
            lines.push(`${indent.repeat(2)}${m.name}: ${jsObject(body, 6)},`);
        }
        lines.push(`${indent}},`);
    }

    // Dimensions
    if (cube.dimensions && cube.dimensions.length > 0) {
        lines.push(`${indent}dimensions: {`);
        for (const d of cube.dimensions) {
            const body: Record<string, any> = {
                sql: d.column,
                type: d.type,
                primaryKey: d.primary_key || null,
                title: d.title,
            };
            lines.push(`${indent.repeat(2)}${d.name}: ${jsObject(body, 6)},`);
        }
        lines.push(`${indent}},`);
    }

    // Segments
    if (cube.segments && cube.segments.length > 0) {
        lines.push(`${indent}segments: {`);
        for (const s of cube.segments) {
            lines.push(`${indent.repeat(2)}${s.name}: { sql: \`${s.expression}\` },`);
        }
        lines.push(`${indent}},`);
    }

    // Joins
    if (cube.joins && cube.joins.length > 0) {
        lines.push(`${indent}joins: {`);
        for (const j of cube.joins) {
            lines.push(`${indent.repeat(2)}${j.name}: { relationship: '${j.relationship}', sql: \`${j.on}\` },`);
        }
        lines.push(`${indent}},`);
    }

    lines.push("});");
    return lines.join("\n");
}

// -------------------------
// YAML generator
// -------------------------

function yamlStringify(obj: any, indent: number = 0): string {
    const spaces = " ".repeat(indent);
    let result = "";
    
    for (const [key, value] of Object.entries(obj)) {
        if (value === null || value === undefined) {
            result += `${spaces}${key}: null\n`;
        } else if (typeof value === "string") {
            result += `${spaces}${key}: ${value}\n`;
        } else if (typeof value === "boolean" || typeof value === "number") {
            result += `${spaces}${key}: ${value}\n`;
        } else if (typeof value === "object" && !Array.isArray(value)) {
            result += `${spaces}${key}:\n`;
            result += yamlStringify(value, indent + 2);
        } else if (Array.isArray(value)) {
            result += `${spaces}${key}:\n`;
            for (const item of value) {
                if (typeof item === 'object') {
                    result += `${spaces}  -\n`;
                    result += yamlStringify(item, indent + 4);
                } else {
                    result += `${spaces}  - ${item}\n`;
                }
            }
        }
    }
    
    return result;
}

export function generateCubeYaml(cube: CubeDescriptor): string {
    const data: Record<string, any> = {
        cube: cube.name,
        table: cube.table,
        sql: cube.sql,
        measures: {},
        dimensions: {},
        segments: {},
        joins: {},
    };

    if (cube.measures && cube.measures.length > 0) {
        for (const m of cube.measures) {
            data.measures[m.name] = {
                type: m.type,
                column: m.column,
                expression: m.expression,
                title: m.title,
            };
        }
    }

    if (cube.dimensions && cube.dimensions.length > 0) {
        for (const d of cube.dimensions) {
            data.dimensions[d.name] = {
                column: d.column,
                type: d.type,
                primary_key: d.primary_key || null,
            };
        }
    }

    if (cube.segments && cube.segments.length > 0) {
        for (const s of cube.segments) {
            data.segments[s.name] = {
                expression: s.expression,
            };
        }
    }

    if (cube.joins && cube.joins.length > 0) {
        for (const j of cube.joins) {
            data.joins[j.name] = {
                relationship: j.relationship,
                on: j.on,
            };
        }
    }

    // Remove empty sections
    const filteredData: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
        if (value && (typeof value !== 'object' || Object.keys(value).length > 0)) {
            filteredData[key] = value;
        }
    }

    return yamlStringify(filteredData);
}

// -------------------------
// Preview generator for cube panels
// -------------------------

export interface CubePreview {
    js: string;
    yaml: string;
}

export function generateCubePreview(cube: CubeDescriptor): CubePreview {
    return {
        js: generateCubeJs(cube),
        yaml: generateCubeYaml(cube)
    };
}

// -------------------------
// Preview for all cubes
// -------------------------

export function generateAllCubePreviews(cubes: CubeDescriptor[]): Record<string, CubePreview> {
    const previews: Record<string, CubePreview> = {};
    
    for (const cube of cubes) {
        if (cube.name) {
            previews[cube.name] = generateCubePreview(cube);
        }
    }
    
    return previews;
}

// -------------------------
// Export utilities for copy/download
// -------------------------

export function downloadCubeAsJs(cube: CubeDescriptor): void {
    const jsContent = generateCubeJs(cube);
    const blob = new Blob([jsContent], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cube.name}.js`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function downloadCubeAsYaml(cube: CubeDescriptor): void {
    const yamlContent = generateCubeYaml(cube);
    const blob = new Blob([yamlContent], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${cube.name}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export async function copyToClipboard(text: string): Promise<void> {
    try {
        await navigator.clipboard.writeText(text);
    } catch (err) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
        document.body.removeChild(textArea);
    }
}