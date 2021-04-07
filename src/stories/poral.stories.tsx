import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Rect, Group } from 'react-konva';

import { Scene } from './Scene';
import { Portal } from '../portal';

export default {
  title: 'Portal',
  component: Portal,
} as Meta;

export const PortalSt = () => (
  <Scene>
    <Portal selector=".top">
      <Rect width={100} height={100} fill="red" draggable />
    </Portal>
    <Rect width={100} height={100} fill="black" draggable />
    <Group name="top" />
  </Scene>
);
PortalSt.storyName = 'Default';
