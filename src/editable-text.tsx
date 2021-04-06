import React from 'react';
import { Group, Text } from 'react-konva';

import { TextEditor } from './text-editor';
import Konva from 'konva';

export const EditorSt = React.forwardRef(({ text, onChange, ...props }) => {
  const [editorEnabled, setEditorEnabled] = React.useState(false);
  const textRef = React.useRef<Konva.Text>();

  return (
    <Group draggable>
      <Text
        text={text}
        ref={textRef}
        width={100}
        onClick={() => {
          setEditorEnabled(true);
        }}
        visible={!editorEnabled}
        {...props}
      />
      {editorEnabled && (
        <Group>
          <TextEditor
            value={text}
            textNodeRef={textRef}
            onChange={onChange}
            onBlur={() => {
              setEditorEnabled(false);
            }}
          />
        </Group>
      )}
    </Group>
  );
});
