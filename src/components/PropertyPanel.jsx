import React from 'react';
import { useEditor } from '../context/EditorContext';
import Slider from './Slider';
import ColorPicker from './ColorPicker'; // Pastikan ColorPicker terimport

export default function PropertyPanel() {
  const { lineStyle, setLineStyle, strokeWidth, setStrokeWidth, rasterAlgo } = useEditor();

  return (
    <div className="panel right-top-panel">
      {/* SEKTOR ATAS: COLOR PALETTE INTEGRAL */}
      <div className="control-group" style={{ marginBottom: '4px' }}>
        <label>Color Picker</label>
        <ColorPicker />
      </div>

      <hr style={{ borderColor: 'rgba(255,255,255,0.05)', margin: '3px 0' }} />

      {/* DROPDOWN LINE STYLE */}
      <div className="control-group">
        <label>Line Style</label>
        <select value={lineStyle} onChange={(e) => setLineStyle(e.target.value)} style={{ fontFamily: 'monospace' }}>
          <option value="solid">Solid ────────────────</option>
          <option value="dashed">Dashed ─ ─ ─ ─ ─ ─ ─ ─</option>
          <option value="dotted">Dotted · · · · · · · ·</option>
          <option value="dash-dotted">DashDotted ─ · ─ · ─ ·</option>
        </select>
      </div>

      <Slider label="Stroke Width" min={1} max={50} value={strokeWidth} onChange={(e) => setStrokeWidth(parseInt(e.target.value))} />

      <div className="control-group">
        <label>Raster Algorithm</label>
        <select value={rasterAlgo} onChange={(e) => setRasterAlgo(e.target.value)}>
          <option value="bresenham">Bresenham's Engine</option>
          <option value="dda">DDA Line Algorithm</option>
        </select>
      </div>
    </div>
  );
}