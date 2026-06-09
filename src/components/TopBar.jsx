import React from 'react';
import { useEditor } from '../context/EditorContext';
import { Undo2, Redo2, FlipHorizontal, FlipVertical } from 'lucide-react';

export default function TopBar() {
  const { 
    undo, redo, canUndo, canRedo, currentTool, currentShape, 
    transformState, setTransformState, layers, activeLayerIndex, setLayers, saveHistory 
  } = useEditor();

  const handleFlip = (axis) => {
    if (activeLayerIndex === -1 || !layers[activeLayerIndex]) return;
    const updated = [...layers];
    if (axis === 'X') updated[activeLayerIndex].scaleX *= -1;
    if (axis === 'Y') updated[activeLayerIndex].scaleY *= -1;
    setLayers(updated);
    saveHistory(updated);
  };

  return (
    <div className="top-bar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <span style={{ fontWeight: '900', fontSize: '16px', color: '#3b82f6', letterSpacing: '1px' }}>ThetaDraw</span>
        <div className="history-controls">
          <button className="tool-btn" style={{width:32, height:32}} disabled={!canUndo} onClick={undo} data-tooltip="Undo (Ctrl+Z)"><Undo2 size={14}/></button>
          <button className="tool-btn" style={{width:32, height:32}} disabled={!canRedo} onClick={redo} data-tooltip="Redo (Ctrl+Y)"><Redo2 size={14}/></button>
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Active: {currentTool} {currentTool === 'GEOMETRY' || currentTool.includes('BOX') ? `[${currentShape}]` : ''}
        </div>
      </div>

      <div className="transform-toolbar" style={{ display: activeLayerIndex !== -1 ? 'flex' : 'none', gap: '6px' }}>
        <button className="tool-btn" style={{width:32, height:32}} onClick={() => handleFlip('X')} data-tooltip="Quick Flip Horisontal (X)"><FlipHorizontal size={14}/></button>
        <button className="tool-btn" style={{width:32, height:32}} onClick={() => handleFlip('Y')} data-tooltip="Quick Flip Vertikal (Y)"><FlipVertical size={14}/></button>
        
        {/* TOMBOL MODE SELEKSI DENGAN PADDING AMAN ANTI-OVERLAP */}
        <button 
          className="tool-btn" 
          style={{ 
            height: '26px', 
            padding: '0 12px', 
            fontSize: '10px', 
            fontWeight: 'bold', 
            background: transformState === 'scale' ? '#3b82f6' : '#f59e0b', 
            borderRadius: '4px', 
            marginLeft: '5px',
            width: 'auto',          /* Mengikuti lebar teks secara dinamis */
            whiteSpace: 'nowrap'     /* Mengunci teks agar tidak patah ke bawah/overlap */
          }}
          onClick={() => setTransformState(transformState === 'scale' ? 'rotate' : 'scale')}
          data-tooltip="Klik tombol ini untuk mengganti mode transformasi boks objek"
        >
          MODE SELEKSI
        </button>
      </div>
    </div>
  );
}