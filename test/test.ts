import { jsonToSolidityTypes } from '../src/index'

// Example usage:
const exampleObject = {
  name: 'Alice',
  age: 30,
  isActive: true,
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

const solidityTypes = jsonToSolidityTypes(exampleObject, { mainTypeName: 'JWT', getTypeNamesFromKeyValues: true })
console.log(solidityTypes.mainType, solidityTypes.types)
