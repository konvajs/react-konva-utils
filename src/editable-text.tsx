import React from 'react';
import { Group, Text } from 'react-konva';

import { TextEditor } from './text-editor';
import Konva from 'konva';
import { TextConfig } from 'konva/lib/shapes/Text';

interface EditorStProps extends TextConfig {
  onChange: () => void;
}

export const EditorSt = React.forwardRef((props: EditorStProps) => {
  const { text, onChange, ...rest } = props
  const [editorEnabled, setEditorEnabled] = React.useState(false);
  const textRef = React.useRef<Konva.Text>(null);

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
        {...rest}
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
