import React from 'react';

import { Stage, Layer } from 'react-konva';

export const Scene = ({ children }) => {
  return (
    <Stage width={500} height={200}>
      <Layer>{children}</Layer>
    </Stage>
  );
};
