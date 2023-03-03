import React from 'react';

const NostoPageType: React.FC = ({ children }) => {
  return (
    <div className="nosto_page_type" style={{ display: 'none' }}>
      {children}
    </div>
  );
};

export default NostoPageType;
