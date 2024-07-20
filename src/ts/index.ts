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
        let ctr = 2

        while (true) {
          addedTypeName = `${typeName}${ctr}`
          if (this.getType(addedTypeName) === undefined) {
            this.solidityTypes[addedTypeName] = typeDescription
            break
          } else if (isEqual(this.getType(addedTypeName), typeDescription)) {
            break
          }
          ctr++
        }
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
}
/**
 *
 * @param obj an arbitrary JS object
 * @param options options that affect how the types object is created
 * @returns
 */
export function jsonToSolidityTypes (obj: any, options?: JsonToSolidityTypesOptions): SolidityTypedSchema {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    throw new Error('JSON expected')
  }
  const opts = { getTypeNamesFromKeyValues: true, ...options }

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
      if (value % 1 !== 0) {
        throw new Error(`Solidity uses only fixed-point arithmetics, and decimals are not supported. ${value}`)
      }
      return 'uint256'
    }
    if (typeof value === 'boolean') return 'bool'
    throw new Error(`Unsupported value type: ${typeof value}`)
  }

  function getObjectType (obj: Record<string, any>, typeName?: string): string {
    const typeDescription: TypeDescriptionObject = []
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        typeDescription.push({ name: key, type: _inferType(obj[key], key) })
      }
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
    if (Array.isArray(value)) {
      let arrayKey: string | undefined
      if (opts.getTypeNamesFromKeyValues && key !== undefined) {
        arrayKey = isPlural(key) ? singular(key) : `${key}Item`
      }
      return getArrayType(value, arrayKey)
    } else if (typeof value === 'object' && value !== null) {
      return (opts.getTypeNamesFromKeyValues && key !== undefined) ? getObjectType(value, key[0].toUpperCase() + key.slice(1)) : getObjectType(value)
    } else {
      return getType(value)
    }
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
