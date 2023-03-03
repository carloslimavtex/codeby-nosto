import React from 'react';

export type NostoPlacementData = {
  id: string | string[];
};

const NostoPlacementClient: React.FC<NostoPlacementData> = ({ id }) => {
  console.info('NOSTO placement', id);

  return (
    <>
      {(Array.isArray(id) ? id : [id]).map((elementId) => (
        <div key={elementId} className="nosto_element" id={elementId} />
      ))}
    </>
  );
};

export default NostoPlacementClient;
