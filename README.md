# Useful components and hooks for [react-konva](https://github.com/konvajs/react-konva/) apps.

## Html

`Html` components allows you to create DOM components inside Konva stage. All DOM components will be placed over canvas content.

```js
import { Html } from 'react-konva-utils';

<Html
  transform // should we apply position transform automatically to DOM container, default is true
  transformFunc={(transformAttrs) => newAttrs} // function to overwrite transformation attributes, not used if transform = false, default is undefined
  groupProps={{}} // additional properties to the group wrapper, useful for some position offset
  divProps={{}} // additional props for wrapped div elements, useful for styles
  parentNodeFunc={(args) => args.stage?.container()} // function to find parent node to insert content, default is stage container
>
  <div>DOM content</div>
</Html>;
```

### How does it work?

Konva is a canvas library. It can't render DOM elements directly. `<Html>` creates an absolutely positioned div over the canvas. The HTML content is not included when you export the canvas as an image.

The most common use case is to create HTML content for temporary tooltips or textareas.

`Html` renders its children in a separate React DOM root. Activity or Suspense hiding disposes that root and recreates the content on reveal. Keep state that must survive hiding outside the hidden subtree.

## Portal

`Portal` allows you to create portal from one Konva container (such as `Layer` or `Group`) into another.

```js
import { Portal } from 'react-konva-utils';

<Layer>
  <Portal selector=".top">
    {/* content of that portal will be moved into "top" group*/}
    <Rect width={100} height={100} fill="red" draggable />
  </Portal>
  <Rect width={100} height={100} fill="black" draggable />
  <Group name="top" />
</Layer>;
```

## Development

Install dependencies and Chromium before running the browser tests:

```sh
npm install
npx playwright install chromium
npm test
npm run build
```

`npm test` runs the browser tests with development and production React, then checks the test types. The tests use the actual `Html` and `Stage` components.
