[![License: {{PKG_LICENSE}}](https://img.shields.io/badge/License-{{PKG_LICENSE}}-yellow.svg)](LICENSE)
[![Contributor Covenant](https://img.shields.io/badge/Contributor%20Covenant-2.1-4baaaa.svg)](CODE_OF_CONDUCT.md)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)
{{BADGES}}

# {{PKG_NAME}}

{{PKG_DESCRIPTION}}

- [Install and use](#install-and-use)
- [Usage example](#usage-example)
- [Supported values and canonicalization](#supported-values-and-canonicalization)
  - [Key-order canonicalization (soundness)](#key-order-canonicalization-soundness)
  - [Unicode NFC normalization (soundness)](#unicode-nfc-normalization-soundness)
  - [Out of scope: canonical JSON bytes for signing](#out-of-scope-canonical-json-bytes-for-signing)
  - [Known heuristic caveats](#known-heuristic-caveats)
- [API reference documentation](#api-reference-documentation)

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

{{BROWSER_BUNDLES_INSTALLATION}}

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
// By default object keys are canonicalised (sorted lexicographically) at every
// nesting level, so the schema is a function of the SEMANTIC object rather
// than of the source key order (see §"Supported values and canonicalization").
// types = {
//   Obj: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
//   Address: [
//     { name: 'arr', type: 'uint256[]' },
//     { name: 'city', type: 'string' },
//     { name: 'obj', type: 'Obj' },
//     { name: 'street', type: 'string' }
//   ],
//   ArrAltItem: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
//   Preference: [
//     { name: 'key', type: 'string' },
//     { name: 'value', type: 'string' }
//   ],
//   JWT: [
//     { name: 'address', type: 'Address' },
//     { name: 'age', type: 'uint256' },
//     { name: 'arrAlt', type: 'ArrAltItem[]' },
//     { name: 'ethAddress', type: 'address' },
//     { name: 'isActive', type: 'bool' },
//     { name: 'name', type: 'string' },
//     { name: 'preferences', type: 'Preference[]' },
//     { name: 'scores', type: 'uint256[]' }
//   ]
// }
```

## Supported values and canonicalization

`jsonToSolidityTypes` is intended for **JSON-compatible** JavaScript values. Its inference rules are:

| JS value                                                         | Inferred Solidity type |
| ---------------------------------------------------------------- | ---------------------- |
| `string` matching `^0x[a-fA-F0-9]{40}$`                          | `address`              |
| any other `string`                                               | `string`               |
| `number`, non-negative safe integer (≤ `Number.MAX_SAFE_INTEGER`) | `uint256`              |
| `bigint` in `[0, 2^256 - 1]`                                     | `uint256`              |
| `boolean`                                                        | `bool`                 |
| plain `object`                                                   | a named struct (recursively inferred) |
| non-empty homogeneous `array` of `T`                             | `T[]`                  |

The following inputs throw a descriptive `Error` (i.e. the function is deliberately partial):

- `null` and `undefined` (at any depth),
- non-integer, negative, `NaN`/`Infinity`, or larger-than-safe `number`,
- `bigint` outside `[0, 2^256 - 1]`,
- `Date`, `Map`, `Set`, class instances and any other non-plain object,
- `symbol`, `function`,
- empty arrays, and arrays whose elements infer to different types.

### Key-order canonicalization (soundness)

The EIP-712 `typeHash` is a function of the **order** of the fields in a struct. If two JSON payloads were semantically equal but differed only in source key order (e.g. `{"a":1,"b":2}` vs `{"b":2,"a":1}`), they would otherwise produce distinct `typeHash`es — a soundness hazard for any signature / verifier pipeline that treats them as equivalent.

To avoid that, **by default the library sorts every object's keys lexicographically (ascending, by UTF-16 code unit) before inference**, at every nesting level. As a consequence, two semantically-equal JSON values always produce the exact same schema, and therefore the exact same `typeHash`. If you need the legacy insertion-order behaviour (library versions ≤ 1.0.1), pass `{ canonicalize: false }`.

### Unicode NFC normalization (soundness)

Object keys are normalized to Unicode **NFC** before emission. This prevents a soundness gap where the same user-visible key (e.g. `"café"`) can be encoded two ways — precomposed (`é` = `U+00E9`) or decomposed (`e` + `U+0301`) — and would otherwise produce distinct type definitions and therefore distinct `typeHash`es depending on the input method of whichever party originated the payload. If two distinct original keys collide after NFC normalization (ambiguous input), the function throws.

### Out of scope: canonical JSON bytes for signing

This library produces a sound **type schema** from a JSON value — that is the whole contract. Canonicalizing the *payload bytes* (and canonicalizing string *values* inside them, e.g. NFC on `string`-typed fields that will be hashed by EIP-712) is the signer's concern and is intentionally **not** part of this library.

If your pipeline needs byte-stable JSON (e.g. for transport, content-addressing, or to guarantee that signer and verifier hash the same bytes), use any [RFC 8785 / JCS](https://datatracker.ietf.org/doc/html/rfc8785) implementation — for example the [`canonicalize`](https://www.npmjs.com/package/canonicalize) npm package — and apply NFC to string values if you care about the Unicode-encoding footgun described above:

```typescript
// In your application code, not in this library:
import canonicalize from 'canonicalize'
import { jsonToSolidityTypes } from '{{PKG_NAME}}'

const { mainType, types } = jsonToSolidityTypes(payload)      // sound schema
const canonicalBytes = canonicalize(payload)                  // RFC 8785 bytes (add NFC as needed)
// ...then sign with your EIP-712 library using (types, mainType, payload).
```

### Known heuristic caveats

- **Address detection is syntactic.** Any 40-hex-character string prefixed with `0x` is classified as `address`. If your domain uses such strings for something that isn't an Ethereum address, wrap them in a sub-object so they are classified as `string` instead.
- **Type-name inference uses English heuristics.** When `getTypeNamesFromKeyValues` is `true` (default), array element type names are derived from the key name via [`pluralize`](https://www.npmjs.com/package/pluralize). That mapping is not injective (e.g. `species → specie`), so two unrelated keys can suggest the same type name. Structural equality via `addType` disambiguates collisions by appending `2`, `3`, …, so soundness is preserved, but the resulting type names may not match your expectations. Disable the heuristic with `{ getTypeNamesFromKeyValues: false }` for fully deterministic `Type`/`Type2`/… names.

## API reference documentation

[Check the API](../../docs/API.md)
