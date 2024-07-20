[![License: EUPL_1.2](https://img.shields.io/badge/License-EUPL_1.2-yellow.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
[![Node.js CI](https://github.com/juanelas/solidity-types-from-json/actions/workflows/build-and-test.yml/badge.svg)](https://github.com/juanelas/solidity-types-from-json/actions/workflows/build-and-test.yml)
[![Coverage Status](https://coveralls.io/repos/github/juanelas/solidity-types-from-json/badge.svg?branch=main)](https://coveralls.io/github/juanelas/solidity-types-from-json?branch=main)

# @juanelas/solidity-types-from-json

Compute solidity types from an arbitrary JS object so that we can use eth_signTypedData (EIP-712) with arbitrary objects

## Install and use

`@juanelas/solidity-types-from-json` can be imported to your project with `npm`:

```console
npm install @juanelas/solidity-types-from-json
```

Then either require (Node.js CJS):

```javascript
const solidityTypesFromJson = require('@juanelas/solidity-types-from-json')
```

or import (JavaScript ES module):

```javascript
import * as solidityTypesFromJson from '@juanelas/solidity-types-from-json'
```

> The appropriate version for browser or node should be automatically chosen when importing. However, if your bundler does not import the appropriate module version (node esm, node cjs or browser esm), you can force it to use a specific one by just importing one of the followings:
>
> - `@juanelas/solidity-types-from-json/dist/cjs/index.node`: for Node.js CJS module
> - `@juanelas/solidity-types-from-json/dist/esm/index.node`: for Node.js ESM module
> - `@juanelas/solidity-types-from-json/dist/esm/index.browser`: for browser ESM module
>
> If you are coding TypeScript, types will not be automatically detected when using the specific versions. You can easily get the types in by creating adding to a types declaration file (`.d.ts`) the following line:
>
> ```typescript
> declare module '@juanelas/solidity-types-from-json/dist/esm/index.browser' // use the specific file you were importing
> ```

You can also download browser ESM, IIFE and UMD bundles directly from the [releases' page](https://gitlab.com/juanelas/solidity-types-from-json/releases and manually add it to your project, or, if you have already installed `@juanelas/solidity-types-from-json` in your projec.

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
const {mainType, types} = solidityTypesFromJson.jsonToSolidityTypes(exampleObject, { mainTypeName: 'JWT' })

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

[Check the API](docs/API.md)
