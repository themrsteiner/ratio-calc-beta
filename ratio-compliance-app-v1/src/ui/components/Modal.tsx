import React from 'react';

export const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode; title: string }> = ({ isOpen, onClose, children, title }) => {
  if (!isOpen) return null;
  return (
    <div 
      style={{
        position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
        background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
      }}
      onClick={onClose}
    >
      <div 
        style={{
          background: '#fff', padding: '24px', borderRadius: '16px', maxWidth: '500px', width: '90%', maxHeight: '90vh', overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2>{title}</h2>
          <button onClick={onClose} className="secondaryButton" style={{ padding: '4px 12px' }}>&times;</button>
        </div>
        {children}
      </div>
    </div>
  );
};
