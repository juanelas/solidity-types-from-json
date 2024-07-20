# @juanelas/solidity-types-from-json v1.0.1

## Interfaces

### JsonToSolidityTypesOptions

#### Properties

| Property | Type | Description |
| ------ | ------ | ------ |
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

#### Parameters

| Parameter | Type | Description |
| ------ | ------ | ------ |
| `obj` | `any` | an arbitrary JS object |
| `options`? | [`JsonToSolidityTypesOptions`](API.md#jsontosoliditytypesoptions) | options that affect how the types object is created |

#### Returns

[`SolidityTypedSchema`](API.md#soliditytypedschema)
