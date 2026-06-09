import React from 'react';

export default function ToolButton({ children, active, hasFlyout, tooltip, onClick, id }) {
  return (
    <button 
      id={id}
      onClick={onClick} 
      className={`tool-btn ${active ? 'active' : ''} ${hasFlyout ? 'has-flyout' : ''}`}
      data-tooltip={tooltip}
    >
      {children}
    </button>
  );
}