import Konva from 'konva';
import React from 'react';
import ReactDOM from 'react-dom';
import { Group } from 'react-konva';

export const Html = ({ children, groupProps, divProps, transform }) => {
  const groupRef = React.useRef<Konva.Group>();
  const container = React.useRef<HTMLDivElement>();

  const shouldTransform = transform ?? true;

  const handleTransform = () => {
    const div = container.current;
    if (!div) {
      return;
    }
    div.style.position = 'absolute';
    div.style.zIndex = '10';
    const { style, ...restProps } = divProps || {};
    // apply deep nesting, because direct assign of "divProps" will overwrite styles above
    Object.assign(div.style, style);
    Object.assign(div, restProps);

    if (shouldTransform) {
      const tr = groupRef.current.getAbsoluteTransform();
      const attrs = tr.decompose();
      div.style.top = attrs.y + 'px';
      div.style.left = attrs.x + 'px';
    }
  };

  React.useEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const parent = group.getStage()?.container();
    if (!parent) {
      return;
    }
    let div = document.createElement('div');
    container.current = div;
    parent.appendChild(div);
    parent.style.position = 'relative';
    parent.style.position = 'relative';
    group.on('_clearTransformCache', handleTransform);
    handleTransform();
    return () => {
      ReactDOM.unmountComponentAtNode(div);
      div.parentNode?.removeChild(div);
    };
  }, [shouldTransform]);

  React.useEffect(() => {
    ReactDOM.render(children, container.current);
  });

  return <Group ref={groupRef} {...groupProps} />;
};
