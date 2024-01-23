import React from 'react';
import { Rect, Group, Transformer } from 'react-konva';

import { Scene } from './Scene';
import { Html } from '../html';

export default {
  title: 'Html',
  component: Html,
};

export const Default = () => (
  <Scene>
    <Group draggable>
      <Rect width={100} height={100} fill="red" />
      <Html divProps={{ style: { border: '1px solid grey' } }}>
        Hello, world
      </Html>
    </Group>
  </Scene>
);
// HtmlSt.storyName = 'Default';

export const NoAutoTransform = () => (
  <Scene>
    <Group draggable>
      <Rect width={100} height={100} fill="red" />
      <Html transform={false}>Hello, world</Html>
    </Group>
  </Scene>
);
// HtmlStNoTransform.storyName = 'No transform';

export const Transforming = () => {
  const groupRef = React.useRef();
  const trRef = React.useRef();

  React.useLayoutEffect(() => {
    trRef.current.nodes([groupRef.current]);
  });
  return (
    <Scene>
      <Group draggable ref={groupRef} x={60} y={60}>
        <Rect width={100} height={100} fill="red" />
        <Html>Hello, world</Html>
      </Group>
      <Transformer ref={trRef} />
    </Scene>
  );
};

export const CalculatedTransforming = () => {
  const groupRef = React.useRef();
  const trRef = React.useRef();

  React.useLayoutEffect(() => {
    trRef.current.nodes([groupRef.current]);
  });

  return (
    <Scene>
      <Group draggable ref={groupRef} x={60} y={60}>
        <Rect width={100} height={100} fill="red" />
        <Html transformFunc={(attrs) => ({ ...attrs, rotation: 0 })}>
          Hello, world
        </Html>
      </Group>
      <Transformer ref={trRef} />
    </Scene>
  );
};

export const CalculatedTransformingChanging = () => {
  const groupRef = React.useRef();
  const trRef = React.useRef();

  const [rotation, setRotation] = React.useState(0);

  React.useLayoutEffect(() => {
    trRef.current.nodes([groupRef.current]);
  });

  React.useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 1);
    }, 100);

    return () => clearInterval(interval);
  });

  return (
    <Scene>
      <Group draggable ref={groupRef} x={60} y={60}>
        <Rect width={100} height={100} fill="red" />
        <Html transformFunc={(attrs) => ({ ...attrs, rotation: rotation })}>
          Hello, world
        </Html>
      </Group>
      <Transformer ref={trRef} />
    </Scene>
  );
};

export const ChangeProps = () => {
  const [style, setStyle] = React.useState({ border: '' });
  const [transform, setTransform] = React.useState(false);

  return (
    <Scene>
      <Group draggable x={60} y={60}>
        <Rect width={100} height={100} fill="red" />
        <Html transform={false}>
          <button
            onClick={() => {
              if (style.border) {
                setStyle({ border: '' });
              } else {
                setStyle({ border: '1px solid black' });
              }
            }}
          >
            toggle style
          </button>
          <button
            onClick={() => {
              setTransform(!transform);
            }}
          >
            toggle transform
          </button>
        </Html>
        <Html divProps={{ style }} transform={transform}>
          Hello, world
        </Html>
      </Group>
    </Scene>
  );
};

const TestContext = React.createContext({ color: 'red' });

const HtmlInternal = () => {
  const data = React.useContext(TestContext);
  return (
    <div>
      <div style={{ color: data.color }}>Hello, world, I should be green.</div>
    </div>
  );
};

export const PassContext = () => {
  return (
    <TestContext.Provider value={{ color: 'green' }}>
      <Scene>
        <Html>
          <HtmlInternal />
        </Html>
      </Scene>
    </TestContext.Provider>
  );
};
