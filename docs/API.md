# @juanelas/solidity-types-from-json v1.0.0

## Interfaces

### JsonToSolidityTypesOptions

#### Properties

| Property | Type |
| ------ | ------ |
| `getTypeNamesFromKeyValues?` | `boolean` |
| `mainTypeName?` | `string` |

***

### SolidityTypedSchema

#### Properties

| Property | Type |
| ------ | ------ |
| `mainType` | `string` |
| `types` | `TypesObject` |

## Functions

### jsonToSolidityTypes()

> **jsonToSolidityTypes**(`obj`, `options`?): [`SolidityTypedSchema`](API.md#soliditytypedschema)

#### Parameters

| Parameter | Type |
| ------ | ------ |
| `obj` | `any` |
| `options`? | [`JsonToSolidityTypesOptions`](API.md#jsontosoliditytypesoptions) |

#### Returns

[`SolidityTypedSchema`](API.md#soliditytypedschema)
