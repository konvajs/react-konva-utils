import React from 'react';
import { Story, Meta } from '@storybook/react';
import { Rect, Group, Text } from 'react-konva';

import { Scene } from './Scene';
import { TextEditor } from '../text-editor';

export default {
  title: 'Editor',
  component: TextEditor,
} as Meta;

export const EditorSt = () => {
  const [text, setText] = React.useState('some text');
  const [editorEnabled, setEditorEnabled] = React.useState(false);
  const textRef = React.useRef();
  return (
    <Scene>
      <Group draggable>
        <Text
          text={text}
          ref={textRef}
          width={100}
          onClick={() => {
            setEditorEnabled(true);
          }}
          visible={!editorEnabled}
        />
        {editorEnabled && (
          <TextEditor
            value={text}
            textNodeRef={textRef}
            onChange={setText}
            onBlur={() => {
              setEditorEnabled(false);
            }}
          />
        )}
      </Group>
    </Scene>
  );
};
EditorSt.storyName = 'Default';
