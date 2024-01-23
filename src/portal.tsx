import Konva from 'konva';
import React from 'react';
import { Group } from 'react-konva';

type PortalProps = {
  selector: string;
  enabled?: boolean;
  children: React.ReactNode;
};

// make a portal implementation
export const Portal = ({ selector, enabled, children }: PortalProps) => {
  // "selector" is a string to find another container to insert all internals
  // if can be like ".top-layer" or "#overlay-group"
  const outer = React.useRef<Konva.Group>(null);
  const inner = React.useRef<Konva.Group>(null);

  const safeRef = React.useRef<Konva.Group>();
  const shouldMove = enabled ?? true;

  React.useLayoutEffect(() => {
    if (!outer.current || !inner.current) {
      return;
    }
    safeRef.current = inner.current;
    const stage = outer.current.getStage() as Konva.Stage;
    const newContainer = stage.findOne(selector);
    if (shouldMove && newContainer) {
      inner.current.moveTo(newContainer);
    } else {
      inner.current.moveTo(outer.current);
    }

    // manually redraw layers
    const outerLayer = outer.current.getLayer();

    if (!outerLayer) return;

    outerLayer.batchDraw();
    if (newContainer) {
      const newContainerLayer = newContainer.getLayer();

      if (!newContainerLayer) return;

      newContainerLayer.batchDraw();
    }
  }, [selector, shouldMove]);

  React.useEffect(() => {
    return () => {
      // manually destroy
      safeRef.current?.destroy();
    };
  }, []);

  // for smooth movement we will have to use two group
  // outer - is main container, will be placed on old position
  // inner - that we will move into another container
  return (
    <Group name="_outer_portal" ref={outer}>
      <Group name="_inner_portal" ref={inner}>
        {children}
      </Group>
    </Group>
  );
};
