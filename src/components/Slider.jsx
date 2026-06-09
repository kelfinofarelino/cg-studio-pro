import React from 'react';

export default function Slider({ label, min, max, value, onChange }) {
  return (
    <div className="control-group">
      <label>{label}</label>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <input type="range" min={min} max={max} value={value} onChange={onChange} />
        <span style={{ fontSize: '12px', width: '25px' }}>{value}px</span>
      </div>
    </div>
  );
}