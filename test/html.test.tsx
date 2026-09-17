import React from 'react';
import type Konva from 'konva';
import { createRoot, type Root } from 'react-dom/client';
import { flushSync } from 'react-dom';
import { Group, Layer, Stage } from 'react-konva';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { page } from 'vitest/browser';
import { Html } from '../src';

let container: HTMLDivElement;
let root: Root;
let consoleError: ReturnType<typeof vi.spyOn>;

// Cross a task boundary so queued renders and deferred cleanup have finished.
const settle = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

const render = (children: React.ReactNode) => {
  flushSync(() => root.render(<React.StrictMode>{children}</React.StrictMode>));
};

const Scene = ({ children }: React.PropsWithChildren) => (
  <Stage width={100} height={100}><Layer>{children}</Layer></Stage>
);

const expectBox = (
  element: Element,
  relativeTo: Element,
  expected: { x: number; y: number; width: number; height: number }
) => {
  const box = element.getBoundingClientRect();
  const origin = relativeTo.getBoundingClientRect();
  expect(box.x - origin.x).toBeCloseTo(expected.x, 1);
  expect(box.y - origin.y).toBeCloseTo(expected.y, 1);
  expect(box.width).toBeCloseTo(expected.width, 1);
  expect(box.height).toBeCloseTo(expected.height, 1);
};

const DraftEditor = () => {
  const [draft, setDraft] = React.useState('');
  return (
    <>
      <input
        aria-label="Note"
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        style={{ display: 'block', width: 120, height: 24, border: 0, padding: 0 }}
      />
      <output aria-label="Draft preview">{draft}</output>
    </>
  );
};

beforeEach(() => {
  consoleError = vi.spyOn(console, 'error');
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(async () => {
  try {
    flushSync(() => root.unmount());
    await settle();
    expect(consoleError).not.toHaveBeenCalled();
  } finally {
    container.remove();
    consoleError.mockRestore();
  }
});

it('keeps Html content mounted and updates it under StrictMode', async () => {
  render(<Scene><Html><span data-content>initial</span></Html></Scene>);
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('initial');

  render(<Scene><Html><span data-content>updated</span></Html></Scene>);
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('updated');
});

it('does not mount DOM children after Html is removed before its queued render', async () => {
  const onMount = vi.fn();
  const Content = () => {
    React.useLayoutEffect(onMount, []);
    return <span>removed</span>;
  };

  render(<Scene><Html><Content /></Html></Scene>);
  render(null);
  await settle();

  expect(onMount).not.toHaveBeenCalled();
  expect(container.children).toHaveLength(0);
});

it('cleans up DOM children and their external container when Html unmounts', async () => {
  let activeSubscriptions = 0;
  const Content = () => {
    React.useLayoutEffect(() => {
      activeSubscriptions++;
      return () => {
        activeSubscriptions--;
      };
    }, []);
    return <span>external content</span>;
  };
  const external = document.createElement('div');
  document.body.appendChild(external);
  try {
    render(
      <Scene><Html parentNodeFunc={() => external}><Content /></Html></Scene>
    );
    await settle();
    expect(external.textContent).toBe('external content');
    expect(activeSubscriptions).toBe(1);

    render(null);
    await settle();
    expect(activeSubscriptions).toBe(0);
    expect(external.children).toHaveLength(0);
  } finally {
    external.remove();
  }
});

it('preserves DOM child state while updating props and bridged context', async () => {
  const Color = React.createContext('default');
  const Counter = ({ label }: { label: string }) => {
    const color = React.useContext(Color);
    const [count, setCount] = React.useState(0);
    return (
      <button onClick={() => setCount(count + 1)}>
        {label}:{color}:{count}
      </button>
    );
  };
  const view = (label: string, color: string) => (
    <Color.Provider value={color}>
      <Scene><Html><Counter label={label} /></Html></Scene>
    </Color.Provider>
  );

  render(view('first', 'green'));
  await settle();
  expect(container.querySelector('button')?.textContent).toBe('first:green:0');
  flushSync(() => container.querySelector('button')!.click());
  expect(container.querySelector('button')?.textContent).toBe('first:green:1');

  render(view('second', 'blue'));
  await settle();
  expect(container.querySelector('button')?.textContent).toBe('second:blue:1');
});

it.skipIf(!React.Activity).each([false, true])('reconnects Html after Activity hiding (settle while hidden: %s)', async (waitWhileHidden) => {
  const view = (mode: 'visible' | 'hidden', text: string) => (
    <React.Activity mode={mode}>
      <Scene><Html><span data-content>{text}</span></Html></Scene>
    </React.Activity>
  );

  render(view('visible', 'initial'));
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('initial');

  render(view('hidden', 'hidden'));
  if (waitWhileHidden) {
    await settle();
    expect(container.querySelector('[data-content]')).toBeNull();
  }
  render(view('visible', 'revealed'));
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('revealed');

  render(view('visible', 'updated'));
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('updated');
});

it('reconnects Html when an outer Suspense fallback is replaced', async () => {
  const pending = new Promise<void>(() => {});
  const Gate = ({ suspended }: { suspended: boolean }) => {
    if (suspended) throw pending;
    return null;
  };
  const view = (suspended: boolean, text: string) => (
    <React.Suspense fallback={<span data-loading>loading</span>}>
      <Scene><Html><span data-content>{text}</span></Html></Scene>
      <Gate suspended={suspended} />
    </React.Suspense>
  );

  render(view(false, 'initial'));
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('initial');

  render(view(true, 'suspended'));
  await settle();
  expect(container.querySelector('[data-content]')).toBeNull();
  expect(container.querySelector('[data-loading]')?.textContent).toBe('loading');

  render(view(false, 'revealed'));
  await settle();
  expect(container.querySelector('[data-content]')?.textContent).toBe('revealed');
  expect(container.querySelector('[data-loading]')).toBeNull();
});

it('keeps an overlay aligned when a nested canvas ancestor moves and rotates', async () => {
  const stage = React.createRef<Konva.Stage>();
  const ancestor = React.createRef<Konva.Group>();
  container.style.padding = '17px 23px';
  render(
    <Stage ref={stage} width={400} height={300}>
      <Layer x={10} y={20}>
        <Group ref={ancestor} x={80} y={60} scaleX={2} scaleY={2}>
          <Group x={5} y={7}>
            <Html groupProps={{ x: 3, y: 4 }}>
              <div data-overlay style={{ width: 40, height: 20 }}>Label</div>
            </Html>
          </Group>
        </Group>
      </Layer>
    </Stage>
  );
  await settle();

  const overlay = container.querySelector('[data-overlay]')!;
  const canvasContainer = stage.current!.container();
  expectBox(overlay, canvasContainer, { x: 106, y: 102, width: 80, height: 40 });

  // Dragging changes Konva coordinates without a React render.
  ancestor.current!.position({ x: 120, y: 100 });
  expectBox(overlay, canvasContainer, { x: 146, y: 142, width: 80, height: 40 });

  ancestor.current!.rotation(90);
  expectBox(overlay, canvasContainer, { x: 68, y: 136, width: 40, height: 80 });
});

it('moves an editor between DOM parents without losing its typed draft', async () => {
  const first = React.createRef<HTMLDivElement>();
  const second = React.createRef<HTMLDivElement>();
  const view = (target: typeof first) => (
    <>
      <div ref={first} />
      <div ref={second} />
      <Scene>
        <Html transform={false} parentNodeFunc={() => target.current!}>
          <DraftEditor />
        </Html>
      </Scene>
    </>
  );

  render(view(first));
  await settle();
  const editor = page.getByRole('textbox', { name: 'Note' });
  await editor.fill('Unsaved note');
  expect(first.current!.querySelector('input')?.value).toBe('Unsaved note');
  expect(first.current!.querySelector('output')?.textContent).toBe('Unsaved note');

  render(view(second));
  await settle();
  expect(first.current!.querySelector('input')).toBeNull();
  expect(second.current!.querySelector('input')?.value).toBe('Unsaved note');
  expect(container.querySelectorAll('input')).toHaveLength(1);

  await editor.fill('Edited in the second panel');
  expect(second.current!.querySelector('output')?.textContent).toBe('Edited in the second panel');

  render(view(first));
  await settle();
  expect(second.current!.querySelector('input')).toBeNull();
  expect(first.current!.querySelector('input')?.value).toBe('Edited in the second panel');
  expect(container.querySelectorAll('input')).toHaveLength(1);
});

it('switches an editor between canvas transforms and normal layout without losing its draft', async () => {
  const host = React.createRef<HTMLDivElement>();
  const ancestor = React.createRef<Konva.Group>();
  const parentNodeFunc = () => host.current!;
  const view = (transform: boolean, x = 30, y = 40) => (
    <>
      <div ref={host} style={{ position: 'relative', width: 300, height: 240 }} />
      <Scene>
        <Group ref={ancestor} x={x} y={y} scaleX={2} scaleY={2}>
          <Html transform={transform} parentNodeFunc={parentNodeFunc}>
            <DraftEditor />
          </Html>
        </Group>
      </Scene>
    </>
  );
  const input = () => host.current!.querySelector('input')!;

  render(view(true));
  await settle();
  const editor = page.getByRole('textbox', { name: 'Note' });
  await editor.fill('Unsaved note');
  expectBox(input(), host.current!, { x: 30, y: 40, width: 240, height: 48 });

  render(view(false));
  await settle();
  expectBox(input(), host.current!, { x: 0, y: 0, width: 120, height: 24 });
  expect(input().value).toBe('Unsaved note');

  ancestor.current!.position({ x: 80, y: 60 });
  expectBox(input(), host.current!, { x: 0, y: 0, width: 120, height: 24 });

  render(view(true, 80, 60));
  await settle();
  expectBox(input(), host.current!, { x: 80, y: 60, width: 240, height: 48 });
  expect(input().value).toBe('Unsaved note');

  ancestor.current!.position({ x: 50, y: 70 });
  expectBox(input(), host.current!, { x: 50, y: 70, width: 240, height: 48 });
  await editor.fill('Edited after toggling');
  expect(host.current!.querySelector('output')?.textContent).toBe('Edited after toggling');
});
