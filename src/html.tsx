import Konva from 'konva';
import React, { HTMLAttributes, PropsWithChildren } from 'react';
import ReactDOM from 'react-dom/client';
import { Group } from 'react-konva';
import { useContextBridge } from 'its-fine';
import { flushSync } from 'react-dom';

const needForceStyle = (el: HTMLDivElement) => {
  const pos = window.getComputedStyle(el).position;
  const ok = pos === 'absolute' || pos === 'relative';
  return !ok;
};

export type HtmlTransformAttrs = {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
};

export type HtmlProps = PropsWithChildren<{
  groupProps?: Konva.ContainerConfig;
  divProps?: HTMLAttributes<HTMLDivElement>;
  transform?: boolean;
  /** When true, the HTML dom will adjust its opacity to match the opacity of parent Konva Elements */
  deriveOpacity?: boolean;
  /** When true, the HTML dom will adjust its visibility to match the opacity of parent Konva Elements */
  deriveVisibility?: boolean;
  transformFunc?: (attrs: HtmlTransformAttrs) => HtmlTransformAttrs;
  parentNodeFunc?: (args: { stage: Konva.Stage | null }) => HTMLDivElement;
}>;

export function useEvent(fn = () => {}) {
  const ref = React.useRef(fn);
  ref.current = fn;
  return React.useCallback((...args) => {
    return ref.current.apply(null, args);
  }, []);
}

export const Html = ({
  children,
  groupProps,
  divProps,
  transform,
  deriveOpacity,
  deriveVisibility,
  transformFunc,
  parentNodeFunc,
}: HtmlProps) => {
  const Bridge = useContextBridge();
  const groupRef = React.useRef<Konva.Group>(null);

  const [div] = React.useState(() => document.createElement('div'));
  const root = React.useMemo(() => ReactDOM.createRoot(div), [div]);

  const shouldTransform = transform ?? true;
  // Following properties are false by default to avoid breaking current default behavior
  // In a major release this should probably default to 'true'
  const shouldDeriveOpaciy = deriveOpacity ?? false;
  const shouldDeriveVisibility = deriveVisibility ?? false;

  const handleTransform = useEvent(() => {
    if (shouldTransform && groupRef.current) {
      const tr = groupRef.current.getAbsoluteTransform();
      let attrs = tr.decompose();
      if (transformFunc) {
        attrs = transformFunc(attrs);
      }
      div.style.position = 'absolute';
      div.style.zIndex = '10';
      div.style.top = '0px';
      div.style.left = '0px';
      div.style.transform = `translate(${attrs.x}px, ${attrs.y}px) rotate(${attrs.rotation}deg) scaleX(${attrs.scaleX}) scaleY(${attrs.scaleY})`;
      div.style.transformOrigin = 'top left';
    } else {
      div.style.position = '';
      div.style.zIndex = '';
      div.style.top = '';
      div.style.left = '';
      div.style.transform = ``;
      div.style.transformOrigin = '';
    }
    const { style, ...restProps } = divProps || {};
    // apply deep nesting, because direct assign of "divProps" will overwrite styles above
    Object.assign(div.style, style);
    Object.assign(div, restProps);
  });

  const handleOpacityChange = useEvent(() => {
    if (groupRef.current) {
      const opacity = groupRef.current.getAbsoluteOpacity();
      div.style.opacity = opacity.toString();
    }
  });

  const handleVisibilityChange = useEvent(() => {
    if (groupRef.current) {
      const isVisible = groupRef.current.isVisible();
      div.style.display = isVisible ? '' : 'none';
    }
  });

  React.useLayoutEffect(() => {
    const group = groupRef.current;
    if (!group) {
      return;
    }
    const parent = parentNodeFunc
      ? parentNodeFunc({ stage: group.getStage() })
      : group.getStage()?.container();
    if (!parent) {
      return;
    }
    parent.appendChild(div);

    if (shouldTransform && needForceStyle(parent)) {
      parent.style.position = 'relative';
    }

    group.on('absoluteTransformChange', handleTransform);
    handleTransform();

    if (shouldDeriveOpaciy) {
      // Listen for opacity changes on the group and all ancestors (recursive)
      const listenToOpacity = (node: Konva.Node | null) => {
        if (!node) return;
        node.on('opacityChange', handleOpacityChange);
        listenToOpacity(node.getParent());
      };
      listenToOpacity(group);
      handleOpacityChange();
    }

    if (shouldDeriveVisibility) {
      // Listen for visibility changes on the group and all ancestors (recursive)
      const listenToVisibility = (node: Konva.Node | null) => {
        if (!node) return;
        node.on('visibleChange', handleVisibilityChange);
        listenToVisibility(node.getParent());
      };
      listenToVisibility(group);
      handleVisibilityChange();
    }
    
    return () => {
      group.off('absoluteTransformChange', handleTransform);

      // Remove opacity listeners from node and all ancestors
      if (shouldDeriveOpaciy) {
        const removeOpacityListeners = (node: Konva.Node | null) => {
          if (!node) return;
          node.off('opacityChange', handleOpacityChange);
          removeOpacityListeners(node.getParent());
        };
        removeOpacityListeners(group);
      }

      if (shouldDeriveVisibility) {
        // Remove visibility listeners from node and all ancestors
        const removeVisibilityListeners = (node: Konva.Node | null) => {
          if (!node) return;
          node.off('visibleChange', handleVisibilityChange);
          removeVisibilityListeners(node.getParent());
        };
        removeVisibilityListeners(group);
      }

      div.parentNode?.removeChild(div);
    };
  }, [shouldTransform, shouldDeriveOpaciy, shouldDeriveVisibility, parentNodeFunc]);

  React.useLayoutEffect(() => {
    handleTransform();
  }, [divProps, transformFunc]);

  React.useLayoutEffect(() => {
    // Run *after* React’s commit but *before* the next paint
    // ideally we should just call root.render here with a sync mode
    // TODO: does React 19 support sync mode?
    // but react doing re-render in async mode
    // in some scenarios we want to see result instantly,
    // so it is in sync with Konva stage
    queueMicrotask(() => {
      flushSync(() => {
        root.render(<Bridge>{children}</Bridge>);
      });
    });
  });

  React.useLayoutEffect(() => {
    return () => {
      // I am not really sure why do we need timeout here
      // but it resolve warnings from react
      // ref: https://github.com/konvajs/react-konva-utils/issues/26
      setTimeout(() => {
        root.unmount();
      });
    };
  }, []);

  return <Group ref={groupRef} {...groupProps} />;
};
