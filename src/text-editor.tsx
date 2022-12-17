import React from 'react';
import { Html } from './html';

export const TextEditor = ({
  textNodeRef,
  value,
  onBlur,
  onChange,
}) => {
  const [style, setStyle] = React.useState<React.CSSProperties>();
  React.useLayoutEffect(() => {
    const textNode = textNodeRef.current;
    // apply many styles to match text on canvas as close as possible
    // remember that text rendering on canvas and on the textarea can be different
    // and sometimes it is hard to make it 100% the same. But we will try...
    const newStyle: React.CSSProperties = {};
    newStyle.width = textNode.width() - textNode.padding() * 2 + 'px';
    newStyle.height = textNode.height() - textNode.padding() * 2 + 10 + 'px';
    newStyle.fontSize = textNode.fontSize() + 'px';
    newStyle.border = 'none';
    newStyle.padding = '0px';
    newStyle.overflow = 'hidden';
    newStyle.background = 'none';
    newStyle.outline = 'none';
    newStyle.resize = 'none';
    newStyle.lineHeight = textNode.lineHeight() + 0.01;
    newStyle.fontFamily = '"' + textNode.fontFamily() + '"';
    newStyle.transformOrigin = 'left top';
    newStyle.textAlign = textNode.align();
    newStyle.color = textNode.fill();
    newStyle.overflowWrap = 'break-word';
    newStyle.whiteSpace = 'normal';
    newStyle.userSelect = 'text';
    newStyle.wordBreak = 'normal';

    if (JSON.stringify(newStyle) !== JSON.stringify(style)) {
      setStyle(newStyle);
    }
  });

  return (
    <Html>
      <textarea
        className="polotno-input"
        style={{
          ...style,
        }}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
        }}
        onBlur={onBlur}
      />
    </Html>
  );
};
