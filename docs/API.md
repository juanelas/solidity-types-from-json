# @juanelas/solidity-types-from-json v1.0.1

## Interfaces

### JsonToSolidityTypesOptions

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `canonicalize?` | `boolean` | Default is true. When true, object keys are sorted lexicographically (ascending, by UTF-16 code unit) at every nesting level before type inference. This guarantees that two JSON values that are semantically equal but differ only in source key order produce the exact same Solidity type schema — and therefore the same EIP-712 `typeHash`. Set to false only if you need to preserve the (insertion-order) behavior of versions prior to 1.1. |
| `getTypeNamesFromKeyValues?` | `boolean` | Default is true. If it is false, typenames will not be inferred from key name. Sometimes it could help reducing the length of the created array of solidity types, since it will not create equal types with different names |
| `mainTypeName?` | `string` | By default main type name will be created automatically as Type<some_number>; you can however manually overwrite that name |

***

### SolidityTypedSchema

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
| `mainType` | `string` | The name of the main type in the types object. Specially useful when the `mainTypeName` option is not specified |
| `types` | `TypesObject` | An array of ethereum types |

## Functions

### jsonToSolidityTypes()

> **jsonToSolidityTypes**(`obj`, `options`?): [`SolidityTypedSchema`](API.md#soliditytypedschema)

Compute the Solidity types for an arbitrary JSON-compatible JavaScript object.

Supported value types:
 - `string` → `address` if it matches `^0x[a-fA-F0-9]{40}$`, otherwise `string`.
   Note: the address heuristic is purely syntactic; any 40-hex string is treated
   as an address. If that is undesirable for your domain, pre-process the input
   (e.g. wrap ambiguous fields in `{ value: "..." }` so they are classified as `string`).
 - `number` → `uint256`, iff the value is a non-negative safe integer
   (`Number.isSafeInteger`). Larger integers MUST be provided as `bigint` to avoid
   silent precision loss.
 - `bigint` → `uint256`, iff `0 <= value <= 2^256 - 1`. Caveat: JSON has no
   `bigint`, so if your payload was reconstructed via `JSON.parse`, large
   `uint256` values arrive as strings; convert them back to `bigint` before
   calling this function or they will be classified as `string`.
 - `boolean` → `bool`.
 - plain `object` → a named struct (recursively inferred). Keys are normalized
   to Unicode NFC; if two keys collide after normalization an error is thrown.
 - non-empty homogeneous `array` → `T[]` where `T` is the type of the (structurally
   equal) elements.

Unsupported values — `null`, `undefined`, non-integer numbers, negative numbers,
`NaN`/`Infinity`, `bigint` out of the uint256 range, `Date` (and other non-plain
objects), `symbol`, and `function` — throw a descriptive `Error`.

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `any` | an arbitrary JS object |
| `options`? | [`JsonToSolidityTypesOptions`](API.md#jsontosoliditytypesoptions) | options that affect how the types object is created |

#### Returns

[`SolidityTypedSchema`](API.md#soliditytypedschema)
