import React, { useState } from 'react';
import { useEditor } from '../context/EditorContext';
import ToolButton from './ToolButton';
import { TOOLS, SHAPES } from '../utils/constants';
import { MousePointer, PenTool, Eraser, PaintBucket, Minus, Square, Triangle, Circle } from 'lucide-react';

export default function Toolbar() {
  const { currentTool, setCurrentTool, currentShape, setCurrentShape, globalColor } = useEditor();
  const [activeDropdown, setActiveDropdown] = useState(null); // 'rect', 'triangle', 'ellipse'

  const selectShape = (tool, shape) => {
    setCurrentTool(tool);
    setCurrentShape(shape);
    setActiveDropdown(null);
  };

  return (
    <div className="panel left-panel">
      <ToolButton active={currentTool === TOOLS.CURSOR} tooltip="Cursor" onClick={() => setCurrentTool(TOOLS.CURSOR)}>
        <MousePointer size={18} />
      </ToolButton>
      <ToolButton active={currentTool === TOOLS.PEN} tooltip="Pen" onClick={() => setCurrentTool(TOOLS.PEN)}>
        <PenTool size={18} />
      </ToolButton>
      <ToolButton active={currentTool === TOOLS.ERASER} tooltip="Pixel Eraser" onClick={() => setCurrentTool(TOOLS.ERASER)}>
        <Eraser size={18} />
      </ToolButton>
      <ToolButton active={currentTool === TOOLS.FILL} tooltip="Fill Bucket" onClick={() => setCurrentTool(TOOLS.FILL)}>
        <PaintBucket size={18} />
      </ToolButton>

      <hr style={{ width: '100%', borderColor: 'rgba(255,255,255,0.05)' }} />

      {/* INDIVIDUAL GEOMETRY TOOLS WITH TARGETED DROPDOWNS */}
      <ToolButton active={currentTool === TOOLS.LINE} tooltip="Line Tool" onClick={() => selectShape(TOOLS.LINE, SHAPES.LINE)}>
        <Minus size={18} style={{ transform: 'rotate(-45deg)' }} />
      </ToolButton>

      {/* DROPDOWN RECTANGLE */}
      <div style={{ position: 'relative' }}>
        <ToolButton 
          active={currentTool === TOOLS.RECTBOX} 
          hasFlyout={true} 
          tooltip="Quadrilateral Tools" 
          onClick={() => setActiveDropdown(activeDropdown === 'rect' ? null : 'rect')}
        >
          <Square size={16} />
        </ToolButton>
        {activeDropdown === 'rect' && (
          <div className="flyout-menu" style={{ display: 'flex', left: '55px' }}>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.RECTBOX, SHAPES.RECT)}>Rectangle</div>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.RECTBOX, SHAPES.SQUARE)}>Square</div>
          </div>
        )}
      </div>

      {/* DROPDOWN TRIANGLE (DENGAN INTEGRASI ISOSCELES) */}
      <div style={{ position: 'relative' }}>
        <ToolButton 
          active={currentTool === TOOLS.TRIANGLEBOX} 
          hasFlyout={true} 
          tooltip="Triangle Tools" 
          onClick={() => setActiveDropdown(activeDropdown === 'triangle' ? null : 'triangle')}
        >
          <Triangle size={16} />
        </ToolButton>
        {activeDropdown === 'triangle' && (
          <div className="flyout-menu" style={{ display: 'flex', left: '55px' }}>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.TRIANGLEBOX, SHAPES.TRIANGLE_EQUILATERAL)}>Equilateral Triangle</div>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.TRIANGLEBOX, SHAPES.TRIANGLE_ISOSCELES)}>Isosceles Triangle</div>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.TRIANGLEBOX, SHAPES.TRIANGLE_RIGHT)}>Right Triangle</div>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.TRIANGLEBOX, SHAPES.TRIANGLE_SCALENE)}>Scalene Triangle</div>
          </div>
        )}
      </div>

      {/* DROPDOWN ELLIPSE */}
      <div style={{ position: 'relative' }}>
        <ToolButton 
          active={currentTool === TOOLS.ELLIPSEBOX} 
          hasFlyout={true} 
          tooltip="Circular Tools" 
          onClick={() => setActiveDropdown(activeDropdown === 'ellipse' ? null : 'ellipse')}
        >
          <Circle size={16} />
        </ToolButton>
        {activeDropdown === 'ellipse' && (
          <div className="flyout-menu" style={{ display: 'flex', left: '55px' }}>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.ELLIPSEBOX, SHAPES.CIRCLE)}>Circle</div>
            <div className="flyout-item" onClick={() => selectShape(TOOLS.ELLIPSEBOX, SHAPES.ELLIPSE)}>Ellipse</div>
          </div>
        )}
      </div>

      {/* INDIKATOR WARNA GLOBAL STATIS DI KIRI BAWAH - ANTI OVERFLOW & OVERLAP */}
      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', width: '100%' }}>
        <label 
          style={{ 
            fontSize: '8px', 
            opacity: 0.6, 
            textAlign: 'center', 
            letterSpacing: '0.5px',
            lineHeight: '10px',
            width: '100%',
            display: 'block'
          }}
        >
          GLOBALS<br/>COLOR
        </label>
        <div 
          style={{ 
            width: '36px', height: '36px', borderRadius: '6px', 
            backgroundColor: globalColor, border: '2px solid rgba(255,255,255,0.15)',
            boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
          }}
        >
        </div>
      </div>
    </div>
  );
}