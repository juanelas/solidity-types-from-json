import pluralize from 'pluralize'
import _ from 'lodash'
const { isEqual } = _
const { isPlural, singular } = pluralize

type PrimitiveType = 'address' | 'string' | 'uint256' | 'bool'
type TypesObject = Record<string, TypeDescriptionObject>
type TypeDescriptionObject = TypedDataField[]
interface TypedDataField {
  name: string
  type: string
}

// 2^256 - 1, the maximum value representable as a Solidity uint256.
const MAX_UINT256 = (1n << 256n) - 1n

// Hard cap on the structural-disambiguation loop in SolidityTypes.addType.
// Practical inputs never approach this; the cap exists to prevent a maliciously
// crafted object from forcing an unbounded probe.
const MAX_TYPE_NAME_PROBES = 1000

class SolidityTypes {
  private solidityTypes: TypesObject

  constructor (protected baseTypeName: string = 'Type') {
    this.solidityTypes = {}
  }

  getTypes (): TypesObject {
    return this.solidityTypes
  }

  getType (typeName: string): TypeDescriptionObject {
    return this.solidityTypes[typeName]
  }

  addType (typeDescription: TypeDescriptionObject, typeName: string = this.baseTypeName): string {
    let addedTypeName = typeName

    if (this.getType(addedTypeName) !== undefined) {
      if (!isEqual(this.getType(addedTypeName), typeDescription)) {
        for (let ctr = 2; ctr <= MAX_TYPE_NAME_PROBES; ctr++) {
          addedTypeName = `${typeName}${ctr}`
          if (this.getType(addedTypeName) === undefined) {
            this.solidityTypes[addedTypeName] = typeDescription
            return addedTypeName
          } else if (isEqual(this.getType(addedTypeName), typeDescription)) {
            return addedTypeName
          }
        }
        throw new Error(`Could not assign a unique name for type "${typeName}" after ${MAX_TYPE_NAME_PROBES} probes; the input has too many distinct shapes that map to the same key-derived name. Pass { getTypeNamesFromKeyValues: false } to use auto-generated Type/Type2/... names instead.`)
      }
    } else {
      this.solidityTypes[addedTypeName] = typeDescription
    }
    return addedTypeName
  }

  deleteType (name: string): void {
    delete this.solidityTypes[name] // eslint-disable-line
  }
}

export interface SolidityTypedSchema {
  /** The name of the main type in the types object. Specially useful when the `mainTypeName` option is not specified */
  mainType: string
  /** An array of ethereum types */
  types: TypesObject
}
export interface JsonToSolidityTypesOptions {
  /** By default main type name will be created automatically as Type<some_number>; you can however manually overwrite that name */
  mainTypeName?: string
  /** Default is true. If it is false, typenames will not be inferred from key name. Sometimes it could help reducing the length of the created array of solidity types, since it will not create equal types with different names */
  getTypeNamesFromKeyValues?: boolean
  /**
   * Default is true. When true, object keys are sorted lexicographically (ascending, by UTF-16 code unit) at every nesting level before type inference. This guarantees that two JSON values that are semantically equal but differ only in source key order produce the exact same Solidity type schema — and therefore the same EIP-712 `typeHash`. Set to false only if you need to preserve the (insertion-order) behavior of versions prior to 1.1.
   */
  canonicalize?: boolean
}
/**
 * Compute the Solidity types for an arbitrary JSON-compatible JavaScript object.
 *
 * Supported value types:
 *  - `string` → `address` if it matches `^0x[a-fA-F0-9]{40}$`, otherwise `string`.
 *    Note: the address heuristic is purely syntactic; any 40-hex string is treated
 *    as an address. If that is undesirable for your domain, pre-process the input
 *    (e.g. wrap ambiguous fields in `{ value: "..." }` so they are classified as `string`).
 *  - `number` → `uint256`, iff the value is a non-negative safe integer
 *    (`Number.isSafeInteger`). Larger integers MUST be provided as `bigint` to avoid
 *    silent precision loss.
 *  - `bigint` → `uint256`, iff `0 <= value <= 2^256 - 1`. Caveat: JSON has no
 *    `bigint`, so if your payload was reconstructed via `JSON.parse`, large
 *    `uint256` values arrive as strings; convert them back to `bigint` before
 *    calling this function or they will be classified as `string`.
 *  - `boolean` → `bool`.
 *  - plain `object` → a named struct (recursively inferred). Keys are normalized
 *    to Unicode NFC; if two keys collide after normalization an error is thrown.
 *  - non-empty homogeneous `array` → `T[]` where `T` is the type of the (structurally
 *    equal) elements.
 *
 * Unsupported values — `null`, `undefined`, non-integer numbers, negative numbers,
 * `NaN`/`Infinity`, `bigint` out of the uint256 range, `Date` (and other non-plain
 * objects), `symbol`, and `function` — throw a descriptive `Error`.
 *
 * @param obj an arbitrary JS object
 * @param options options that affect how the types object is created
 * @returns
 */
export function jsonToSolidityTypes (obj: any, options?: JsonToSolidityTypesOptions): SolidityTypedSchema {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj) || !isPlainObject(obj)) {
    throw new Error('JSON object expected as the top-level input')
  }
  const opts = { getTypeNamesFromKeyValues: true, canonicalize: true, ...options }

  const types = new SolidityTypes()

  if (typeof opts.mainTypeName === 'string' && opts.mainTypeName !== '') {
    // Let us reserve the MainTypeName just in case a subtype uses it
    types.addType([], opts.mainTypeName)
  }

  function getType (value: any): PrimitiveType {
    if (typeof value === 'string') {
      if (/^0x[a-fA-F0-9]{40}$/.test(value)) { // if it is an ethereum address
        return 'address'
      }
      return 'string'
    }
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new Error(`Non-finite numbers are not supported: ${String(value)}`)
      }
      if (value % 1 !== 0) {
        throw new Error(`Solidity uses only fixed-point arithmetics, and decimals are not supported. ${value}`)
      }
      if (value < 0) {
        throw new Error(`Negative numbers are not supported (inferred Solidity type is uint256): ${value}`)
      }
      if (!Number.isSafeInteger(value)) {
        throw new Error(`Integer exceeds Number.MAX_SAFE_INTEGER (2^53 - 1); pass it as a bigint to preserve precision: ${value}`)
      }
      return 'uint256'
    }
    if (typeof value === 'bigint') {
      if (value < 0n) {
        throw new Error(`Negative bigint is not supported (inferred Solidity type is uint256): ${value}`)
      }
      if (value > MAX_UINT256) {
        throw new Error(`bigint exceeds uint256 maximum (2^256 - 1): ${value}`)
      }
      return 'uint256'
    }
    if (typeof value === 'boolean') return 'bool'
    if (value === undefined) throw new Error('undefined values are not supported')
    throw new Error(`Unsupported value type: ${typeof value}`)
  }

  // Returns own enumerable string keys, NFC-normalized, optionally lexicographically
  // sorted. Throws if two original keys collide after NFC normalization (ambiguous
  // input).
  function orderedKeys (o: Record<string, any>): Array<{ originalKey: string, canonicalKey: string }> {
    const pairs = Object.keys(o).map(k => ({ originalKey: k, canonicalKey: k.normalize('NFC') }))
    const seen = new Set<string>()
    for (const p of pairs) {
      if (seen.has(p.canonicalKey)) {
        throw new Error(`Duplicate key after Unicode NFC normalization: "${p.canonicalKey}"`)
      }
      seen.add(p.canonicalKey)
    }
    if (opts.canonicalize) {
      pairs.sort((a, b) => (a.canonicalKey < b.canonicalKey) ? -1 : (a.canonicalKey > b.canonicalKey) ? 1 : 0)
    }
    return pairs
  }

  function getObjectType (obj: Record<string, any>, typeName?: string): string {
    const typeDescription: TypeDescriptionObject = []
    for (const { originalKey, canonicalKey } of orderedKeys(obj)) {
      typeDescription.push({ name: canonicalKey, type: _inferType(obj[originalKey], canonicalKey) })
    }
    return types.addType(typeDescription, typeName)
  }

  function getArrayType (arr: any[], key?: string): string {
    if (arr.length === 0) {
      throw new Error('Empty arrays are not supported')
    }
    const firstElementType = _inferType(arr[0], opts.getTypeNamesFromKeyValues ? key : undefined)
    for (const element of arr) {
      const elementType = _inferType(element, opts.getTypeNamesFromKeyValues ? key : undefined)
      if (elementType !== firstElementType) {
        throw new Error(`Array elements are of different types\n: ${JSON.stringify(types.getType(firstElementType), null, 2)}\n!=\n${JSON.stringify(types.getType(elementType), null, 2)}`)
      }
    }
    return `${firstElementType}[]`
  }

  function _inferType (value: any, key?: string): string {
    if (value === null) {
      throw new Error('null values are not supported')
    }
    if (Array.isArray(value)) {
      let arrayKey: string | undefined
      if (opts.getTypeNamesFromKeyValues && key !== undefined) {
        arrayKey = isPlural(key) ? singular(key) : `${key}Item`
      }
      return getArrayType(value, arrayKey)
    }
    if (typeof value === 'object') {
      if (!isPlainObject(value)) {
        throw new Error(`Unsupported non-plain object (e.g. Date, Map, Set, class instance) at key "${key ?? ''}". Convert to a plain JSON object first.`)
      }
      return (opts.getTypeNamesFromKeyValues && key !== undefined) ? getObjectType(value, key[0].toUpperCase() + key.slice(1)) : getObjectType(value)
    }
    return getType(value)
  }

  if (typeof opts.mainTypeName === 'string' && opts.mainTypeName !== '') {
    types.deleteType(opts.mainTypeName) // delete previously reserved main type name
  }

  const mainType = getObjectType(obj, opts.mainTypeName)

  return {
    mainType,
    types: types.getTypes()
  }
}

function isPlainObject (value: unknown): value is Record<string, any> {
  if (value === null || typeof value !== 'object') return false
  const proto = Object.getPrototypeOf(value)
  return proto === null || proto === Object.prototype
}
