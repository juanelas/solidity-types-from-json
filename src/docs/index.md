[![License: {{PKG_LICENSE}}](https://img.shields.io/badge/License-{{PKG_LICENSE}}-yellow.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
{{BADGES}}

# {{PKG_NAME}}

{{PKG_DESCRIPTION}}

## Install and use

`{{PKG_NAME}}` can be imported to your project with `npm`:

```console
npm install {{PKG_NAME}}
```

Then either require (Node.js CJS):

```javascript
const {{PKG_CAMELCASE}} = require('{{PKG_NAME}}')
```

or import (JavaScript ES module):

```javascript
import * as {{PKG_CAMELCASE}} from '{{PKG_NAME}}'
```

> The appropriate version for browser or node should be automatically chosen when importing. However, if your bundler does not import the appropriate module version (node esm, node cjs or browser esm), you can force it to use a specific one by just importing one of the followings:
>
> - `{{PKG_NAME}}/dist/cjs/index.node`: for Node.js CJS module
> - `{{PKG_NAME}}/dist/esm/index.node`: for Node.js ESM module
> - `{{PKG_NAME}}/dist/esm/index.browser`: for browser ESM module
>
> If you are coding TypeScript, types will not be automatically detected when using the specific versions. You can easily get the types in by creating and importing to your TS project a new types declaration file `{{PKG_NAME_NO_SCOPE}}.d.ts` with the following line:
>
> ```typescript
> declare module '{{PKG_NAME}}/dist/esm/index.browser' // use the specific module file you are importing
> ```

You can also download browser ESM, IIFE and UMD bundles directly from the {{RELEASES_PAGE}} and manually add them to your project.

## Usage example

```typescript
const exampleObject = {
  name: 'Alice',
  age: 30,
  isActive: true,
  ethAddress: '0xe688b84b23f322a994A53dbF8E15FA82CDB71127',
  address: {
    street: '123 Main St',
    city: 'Wonderland',
    arr: [2, 3],
    obj: {
      a: 1,
      b: false
    }
  },
  scores: [100, 200, 300],
  preferences: [
    { key: 'color', value: 'blue' },
    { key: 'size', value: 'medium' }
  ],
  arrAlt: [
    { a: 4, b: true }
  ]
}
const {mainType, types} = {{PKG_CAMELCASE}}.jsonToSolidityTypes(exampleObject, { mainTypeName: 'JWT' })

// mainType = 'JWT'
// types = {
//   Obj: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
//   Address: [
//     { name: 'street', type: 'string' },
//     { name: 'city', type: 'string' },
//     { name: 'arr', type: 'uint256[]' },
//     { name: 'obj', type: 'Obj' }
//   ],
//   Preference: [
//     { name: 'key', type: 'string' },
//     { name: 'value', type: 'string' }
//   ],
//   ArrAltItem: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
//   JWT: [
//     { name: 'name', type: 'string' },
//     { name: 'age', type: 'uint256' },
//     { name: 'isActive', type: 'bool' },
//     { name: 'ethAddress', type: 'address' },
//     { name: 'address', type: 'Address' },
//     { name: 'scores', type: 'uint256[]' },
//     { name: 'preferences', type: 'Preference[]' },
//     { name: 'arrAlt', type: 'ArrAltItem[]' }
//   ]
// }
```

## API reference documentation

[Check the API](../../docs/API.md)
