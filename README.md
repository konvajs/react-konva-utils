# Useful components and hooks for [react-konva](https://github.com/konvajs/react-konva/) apps.

### Html

`Html` components allows you to create DOM components inside Konva stage. All DOM components will be placed over canvas content.

```js
import { Html } from 'react-konva-utils';

<Html
  transform // should we apply position transform automatically to DOM container, default is true
  transformFunc={(transformAttrs) => newAttrs} // function to overwrite transformation attributes, not used if transform = false, default is undefined
  groupProps={{}} // additional properties to the group wrapper, useful for some position offset
  divProps={{}} // additional props for wrapped div elements, useful for styles
>
  <div>DOM content</div>
</Html>;
```

### Portal

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
