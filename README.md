# Useful components and hooks for [react-konva](https://github.com/konvajs/react-konva/) apps.

### Html

`Html` components allows you to create DOM components inside Konva stage. All DOM components will be placed over canvas content.

```js
import { Html } from 'react-konva-utils';

<Group>
  <Html><div>DOM content</Html>
</Group>
```

### Portal

`Portal` allows you to create portal from one Konva container (such as `Layer` or `Group`) into another.

```js
import { Html } from 'react-konva-utils';

<Layer>
  <Portal selector=".top">
    {/* content of that portal will be moved into "top" group*/}
    <Rect width={100} height={100} fill="red" draggable />
  </Portal>
  <Rect width={100} height={100} fill="black" draggable />
  <Group name="top" />
</Layer>;
```
