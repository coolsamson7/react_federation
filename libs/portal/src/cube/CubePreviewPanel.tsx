/**
 * Cube Preview Panel Component (Fixed Version)
 * Shows JS and YAML previews of cube definitions
 * Fixed to avoid HTML injection in copy/download operations
 */

import React, { useState, useEffect } from "react";
import { 
    Code, 
    Copy, 
    Download, 
    Eye, 
    FileText, 
    Check
} from "lucide-react";
import { CubeDescriptor } from './cube-metadata';
import { 
    generateCubePreview, 
    downloadCubeAsJs, 
    downloadCubeAsYaml, 
    copyToClipboard,
    CubePreview 
} from './cube-preview-generator';

interface CubePreviewPanelProps {
    cube: CubeDescriptor;
    visible: boolean;
    onToggle: () => void;
}

type PreviewFormat = 'js' | 'yaml';

export const CubePreviewPanel: React.FC<CubePreviewPanelProps> = ({
    cube,
    visible,
    onToggle
}) => {
    const [activeFormat, setActiveFormat] = useState<PreviewFormat>('js');
    const [preview, setPreview] = useState<CubePreview | null>(null);
    const [copyStatus, setCopyStatus] = useState<{ [key in PreviewFormat]: boolean }>({ js: false, yaml: false });

    // Generate preview when cube changes
    useEffect(() => {
        if (cube) {
            const newPreview = generateCubePreview(cube);
            setPreview(newPreview);
        }
    }, [cube]);

    const handleCopy = async (format: PreviewFormat) => {
        if (!preview) return;
        
        try {
            await copyToClipboard(preview[format]);
            setCopyStatus(prev => ({ ...prev, [format]: true }));
            setTimeout(() => {
                setCopyStatus(prev => ({ ...prev, [format]: false }));
            }, 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const handleDownload = (format: PreviewFormat) => {
        if (format === 'js') {
            downloadCubeAsJs(cube);
        } else {
            downloadCubeAsYaml(cube);
        }
    };

    if (!visible) {
        return null;
    }

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '500px',
            height: '100vh',
            backgroundColor: '#0b141a',
            borderLeft: '1px solid #2a2f32',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 1000,
            overflow: 'hidden'
        }}>
            {/* Header */}
            <div style={{
                padding: '16px 20px',
                backgroundColor: '#1f2c33',
                borderBottom: '1px solid #2a2f32',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px'
                }}>
                    <Eye size={20} color="#00a884" />
                    <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#e9edef' }}>
                            Preview: {cube.title || cube.name}
                        </h3>
                        <div style={{ fontSize: '12px', color: '#8696a0', marginTop: '2px' }}>
                            Live cube definition preview
                        </div>
                    </div>
                </div>
                <button
                    onClick={onToggle}
                    style={{
                        background: 'none',
                        border: 'none',
                        color: '#8696a0',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#e9edef'}
                    onMouseLeave={(e) => e.currentTarget.style.color = '#8696a0'}
                >
                    ✕
                </button>
            </div>

            {/* Format Tabs */}
            <div style={{
                display: 'flex',
                backgroundColor: '#111b21',
                borderBottom: '1px solid #2a2f32'
            }}>
                {(['js', 'yaml'] as const).map((format) => (
                    <button
                        key={format}
                        onClick={() => setActiveFormat(format)}
                        style={{
                            flex: 1,
                            padding: '12px 16px',
                            backgroundColor: activeFormat === format ? '#1f2c33' : 'transparent',
                            border: 'none',
                            color: activeFormat === format ? '#00a884' : '#8696a0',
                            fontSize: '14px',
                            fontWeight: '500',
                            cursor: 'pointer',
                            borderBottom: activeFormat === format ? '2px solid #00a884' : '2px solid transparent',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.2s'
                        }}
                    >
                        {format === 'js' ? <Code size={16} /> : <FileText size={16} />}
                        {format.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Actions Bar */}
            <div style={{
                display: 'flex',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#111b21',
                borderBottom: '1px solid #2a2f32'
            }}>
                <button
                    onClick={() => handleCopy(activeFormat)}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#2a3942',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#e9edef',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b4a54'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a3942'}
                >
                    {copyStatus[activeFormat] ? <Check size={14} /> : <Copy size={14} />}
                    {copyStatus[activeFormat] ? 'Copied!' : 'Copy'}
                </button>
                <button
                    onClick={() => handleDownload(activeFormat)}
                    style={{
                        padding: '6px 12px',
                        backgroundColor: '#2a3942',
                        border: 'none',
                        borderRadius: '6px',
                        color: '#e9edef',
                        fontSize: '12px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b4a54'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2a3942'}
                >
                    <Download size={14} />
                    Download
                </button>
            </div>

            {/* Preview Content */}
            <div style={{
                flex: 1,
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column'
            }}>
                {preview && (
                    <div style={{
                        flex: 1,
                        overflow: 'auto',
                        padding: '16px',
                        backgroundColor: '#0b141a'
                    }}>
                        <pre
                            style={{
                                margin: 0,
                                fontFamily: '"Fira Code", "Monaco", "Consolas", monospace',
                                fontSize: '12px',
                                lineHeight: '1.5',
                                color: '#e9edef',
                                whiteSpace: 'pre-wrap',
                                overflowWrap: 'break-word'
                            }}
                        >
                            {preview[activeFormat]}
                        </pre>
                    </div>
                )}
            </div>

            {/* Cube Summary */}
            <div style={{
                padding: '16px',
                backgroundColor: '#111b21',
                borderTop: '1px solid #2a2f32'
            }}>
                <div style={{ fontSize: '12px', color: '#8696a0', marginBottom: '8px' }}>
                    Cube Summary
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#2a3942', borderRadius: '8px' }}>
                        {cube.measures?.length || 0} measures
                    </span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#2a3942', borderRadius: '8px' }}>
                        {cube.dimensions?.length || 0} dimensions
                    </span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#2a3942', borderRadius: '8px' }}>
                        {cube.joins?.length || 0} joins
                    </span>
                    <span style={{ fontSize: '11px', padding: '4px 8px', backgroundColor: '#2a3942', borderRadius: '8px' }}>
                        {cube.segments?.length || 0} segments
                    </span>
                </div>
            </div>
        </div>
    );
};

// Export the preview panel as default
export default CubePreviewPanel;