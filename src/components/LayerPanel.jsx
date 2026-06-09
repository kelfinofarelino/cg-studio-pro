import React from 'react';
import { useEditor } from '../context/EditorContext';

export default function LayerPanel({ onFlatten }) {
  const { layers, setLayers, activeLayerIndex, setActiveLayerIndex, deleteSelectedLayer } = useEditor();

  const moveLayer = (idx, direction) => {
    if (direction === 'up' && idx < layers.length - 1) {
      const updated = [...layers];
      [updated[idx], updated[idx + 1]] = [updated[idx + 1], updated[idx]];
      setLayers(updated); setActiveLayerIndex(idx + 1);
    }
    if (direction === 'down' && idx > 0) {
      const updated = [...layers];
      [updated[idx], updated[idx - 1]] = [updated[idx - 1], updated[idx]];
      setLayers(updated); setActiveLayerIndex(idx - 1);
    }
  };

  return (
    <div className="panel right-bottom-panel">
      <label style={{ marginBottom: '6px', display: 'block' }}>Layers Stack</label>
      <div className="layer-container">
        {layers.map((layer, i) => (
          <div key={i} className={`layer-item ${i === activeLayerIndex ? 'active' : ''}`} onClick={() => setActiveLayerIndex(i)}>
            <span>{layer.name}</span>
            <div className="layer-actions">
              <button className="layer-btn" onClick={(e) => { e.stopPropagation(); moveLayer(i, 'up'); }}>▲</button>
              <button className="layer-btn" onClick={(e) => { e.stopPropagation(); moveLayer(i, 'down'); }}>▼</button>
            </div>
          </div>
        )).reverse()}
      </div>
      <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
        {/* TOMBOL DELETE BERWARNA MERAH TERANG */}
        <button 
          className="btn-flatten" 
          style={{ flex: 1, margin: 0, backgroundColor: '#ef4444' }} 
          disabled={activeLayerIndex === -1} 
          onClick={deleteSelectedLayer}
        >
          Delete Object
        </button>
        <button className="btn-flatten" style={{ flex: 1, margin: 0 }} onClick={onFlatten}>Flatten App</button>
      </div>
    </div>
  );
}