import React from 'react';

interface PanelToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export const PanelToggle: React.FC<PanelToggleProps> = ({ isOpen, onToggle }) => {
  return (
    <button 
      className="secondaryButton" 
      type="button" 
      onClick={onToggle}
      style={{ 
        width: '32px', 
        height: '32px', 
        padding: 0, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        fontSize: '1.4rem' 
      }}
    >
      <span style={{ marginTop: isOpen ? '-2px' : '0' }}>{isOpen ? '▾' : '▸'}</span>
    </button>
  );
};
