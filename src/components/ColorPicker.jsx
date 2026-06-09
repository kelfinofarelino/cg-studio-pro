import React, { useState, useEffect, useRef } from 'react';
import { useEditor } from '../context/EditorContext';
import { PRESET_COLORS } from '../utils/colors';

// --- FUNGSI UTILS KONVERSI MATEMATIKA RUANG WARNA GRAFIKA KOMPUTER ---
function hsvToHex(h, s, v) {
  s /= 100; v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;
  
  if (h >= 0 && h < 60) { r = c; g = x; }
  else if (h >= 60 && h < 120) { r = x; g = c; }
  else if (h >= 120 && h < 180) { g = c; b = x; }
  else if (h >= 180 && h < 240) { g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = b; }
  else if (h >= 300 && h <= 360) { r = c; b = x; }
  
  const toHexStr = (val) => Math.round((val + m) * 255).toString(16).padStart(2, '0');
  return `#${toHexStr(r)}${toHexStr(g)}${toHexStr(b)}`;
}

function hexToHsv(hex) {
  if (!hex || hex.length < 7) return { h: 0, s: 100, v: 100 };
  const r = parseInt(hex.substring(1, 3), 16) / 255;
  const g = parseInt(hex.substring(3, 5), 16) / 255;
  const b = parseInt(hex.substring(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;

  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), v: Math.round(v * 100) };
}

export default function ColorPicker() {
  const { globalColor, setGlobalColor } = useEditor();
  
  // State lokal berbasis HSV untuk rendering koordinat bidik pin picker
  const [hsv, setHsv] = useState({ h: 215, s: 76, v: 96 });
  const [hexInput, setHexInput] = useState(globalColor);

  const svBoxRef = useRef(null);
  const hueSliderRef = useRef(null);

  // Efek sinkronisasi balik jika warna global berubah via tombol preset di luar picker
  useEffect(() => {
    if (globalColor.toLowerCase() !== hsvToHex(hsv.h, hsv.s, hsv.v).toLowerCase()) {
      setHsv(hexToHsv(globalColor));
    }
    setHexInput(globalColor.toUpperCase());
  }, [globalColor]);

  const updateColor = (newH, newS, newV) => {
    setHsv({ h: newH, s: newS, v: newV });
    const hex = hsvToHex(newH, newS, newV);
    setGlobalColor(hex);
    setHexInput(hex.toUpperCase());
  };

  // --- LOGIKA MOUSE DRAG DRAG SATURATION & VALUE SQUARE ---
  const handleSvMousedown = (e) => {
    const handleMove = (moveEvent) => {
      if (!svBoxRef.current) return;
      const rect = svBoxRef.current.getBoundingClientRect();
      let x = moveEvent.clientX - rect.left;
      let y = moveEvent.clientY - rect.top;

      // Batasi koordinat agar tidak menembus dinding luar kotak gradient
      x = Math.max(0, Math.min(rect.width, x));
      y = Math.max(0, Math.min(rect.height, y));

      const s = Math.round((x / rect.width) * 100);
      const v = Math.round((1 - y / rect.height) * 100);
      updateColor(hsv.h, s, v);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
    handleMove(e);
  };

  // --- LOGIKA MOUSE DRAG VERTICAL HUE RAINBOW BAR ---
  const handleHueMousedown = (e) => {
    const handleMove = (moveEvent) => {
      if (!hueSliderRef.current) return;
      const rect = hueSliderRef.current.getBoundingClientRect();
      let y = moveEvent.clientY - rect.top;
      y = Math.max(0, Math.min(rect.height, y));

      const h = Math.round((y / rect.height) * 360);
      updateColor(h, hsv.s, hsv.v);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleMouseUp);
    handleMove(e);
  };

  const handleHexInputChange = (e) => {
    const val = e.target.value;
    setHexInput(val);
    if (val.length === 7 && val.startsWith('#')) {
      setGlobalColor(val);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', padding: '2px 0' }}>
      
      {/* SEKTOR LAYOUT UTAMA: GRADIENT BOX & RAINBOW SLIDER (PHOTOSHOP STYLE) */}
      <div style={{ display: 'flex', gap: '10px', height: '140px', width: '100%' }}>
        
        {/* KOTAK SATURATION & VALUE GRADIENT */}
        <div 
          ref={svBoxRef}
          onMouseDown={handleSvMousedown}
          style={{ 
            flex: 1, 
            position: 'relative', 
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`, 
            borderRadius: '4px',
            cursor: 'crosshair',
            overflow: 'hidden',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)'
          }}
        >
          {/* Overlay gradien putih (kiri ke kanan) dan hitam (atas ke bawah) */}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #fff, transparent)' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent, #000)' }} />
          
          {/* PIN INDIKATOR PENUNJUK TARGET BULAT */}
          <div 
            style={{
              position: 'absolute',
              left: `${hsv.s}%`,
              top: `${100 - hsv.v}%`,
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              border: '1.5px solid #fff',
              boxShadow: '0 0 2px #000',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none'
            }}
          />
        </div>

        {/* SLIDER VERTICAL RAINBOW HUE */}
        <div 
          ref={hueSliderRef}
          onMouseDown={handleHueMousedown}
          style={{ 
            width: '18px', 
            height: '100%', 
            borderRadius: '4px',
            cursor: 'row-resize',
            position: 'relative',
            boxShadow: '0 0 4px rgba(0,0,0,0.4)',
            background: 'linear-gradient(to bottom, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
          }}
        >
          {/* SLIDER HANDLE SEGITIGA/GARIS INDIKATOR HUE */}
          <div 
            style={{
              position: 'absolute',
              left: '-2px',
              right: '-2px',
              top: `${(hsv.h / 360) * 100}%`,
              height: '3px',
              background: '#fff',
              border: '1px solid #000',
              borderRadius: '1px',
              transform: 'translateY(-50%)',
              pointerEvents: 'none'
            }}
          />
        </div>

      </div>

      {/* INPUT KODE TEXT HEX DATA FIELD */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <label style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 'bold' }}>HEX</label>
        <input 
          type="text" 
          value={hexInput}
          onChange={handleHexInputChange}
          maxLength={7}
          style={{ 
            flex: 1,
            background: '#12131a', 
            border: '1px solid var(--panel-border)', 
            color: '#fff',
            padding: '4px 8px',
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '11px',
            textTransform: 'uppercase'
          }} 
        />
        {/* MINI BOX PREVIEW WARNA AKTIF */}
        <div style={{ width: '22px', height: '22px', borderRadius: '4px', backgroundColor: globalColor, border: '1px solid rgba(255,255,255,0.1)' }} />
      </div>

      {/* PALET PRESET WARNA INSTAN DI BAGIAN BAWAH */}
      <div className="preset-colors" style={{ gridTemplateColumns: 'repeat(5, 1fr)', gap: '5px', width: '100%' }}>
        {PRESET_COLORS.map(c => (
          <div 
            key={c} 
            className={`color-dot ${globalColor.toLowerCase() === c.toLowerCase() ? 'active' : ''}`} 
            style={{ 
              backgroundColor: c, 
              height: '18px', 
              borderRadius: '3px',
              border: globalColor.toLowerCase() === c.toLowerCase() ? '2px solid #3b82f6' : '1px solid rgba(255,255,255,0.1)'
            }} 
            onClick={() => setGlobalColor(c)} 
          />
        ))}
      </div>

    </div>
  );
}