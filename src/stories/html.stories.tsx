import React from 'react';
import { Rect, Group } from 'react-konva';

import { Scene } from './Scene';
import { Html } from '../html';

export default {
  title: 'Html',
  component: Html,
};

export const HtmlSt = () => (
  <Scene>
    <Group draggable>
      <Rect width={100} height={100} fill="red" />
      <Html divProps={{ style: { border: '1px solid grey' } }}>
        Hello, world
      </Html>
    </Group>
  </Scene>
);
HtmlSt.storyName = 'Default';

export const HtmlStNoTransform = () => (
  <Scene>
    <Group draggable>
      <Rect width={100} height={100} fill="red" />
      <Html transform={false}>Hello, world</Html>
    </Group>
  </Scene>
);
HtmlStNoTransform.storyName = 'No transform';
