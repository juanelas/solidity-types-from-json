import { jsonToSolidityTypes } from '#pkg'

describe(`testing ${_MODULE_TYPE}-module function jsonToSolidityTypes(obj)`, function () {
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
  const expectedTypes = {
    Obj: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
    Address: [
      { name: 'street', type: 'string' },
      { name: 'city', type: 'string' },
      { name: 'arr', type: 'uint256[]' },
      { name: 'obj', type: 'Obj' }
    ],
    Preference: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' }
    ],
    ArrAltItem: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
    Type: [
      { name: 'name', type: 'string' },
      { name: 'age', type: 'uint256' },
      { name: 'isActive', type: 'bool' },
      { name: 'ethAddress', type: 'address' },
      { name: 'address', type: 'Address' },
      { name: 'scores', type: 'uint256[]' },
      { name: 'preferences', type: 'Preference[]' },
      { name: 'arrAlt', type: 'ArrAltItem[]' }
    ]
  }
  it('should return the expected types', function () {
    const { types } = jsonToSolidityTypes(exampleObject)
    chai.expect(JSON.stringify(types) === JSON.stringify(expectedTypes), JSON.stringify(types, null, 2)).to.be.true // eslint-disable-line
  })
  it('should properly use mainTypeName', function () {
    const { types } = jsonToSolidityTypes(exampleObject, { mainTypeName: 'JWT' })
    const newlyExpectedTypes: any = { ...expectedTypes }
    newlyExpectedTypes.JWT = newlyExpectedTypes.Type
    delete newlyExpectedTypes.Type
    chai.expect(JSON.stringify(types) === JSON.stringify(newlyExpectedTypes), JSON.stringify(types, null, 2)).to.be.true // eslint-disable-line
  })
  it('should properly use getTypeNamesFromKeyValues', function () {
    const { types } = jsonToSolidityTypes(exampleObject, { getTypeNamesFromKeyValues: false })
    const newlyExpectedTypes = {
      Type: [
        {
          name: 'a',
          type: 'uint256'
        },
        {
          name: 'b',
          type: 'bool'
        }
      ],
      Type2: [
        {
          name: 'street',
          type: 'string'
        },
        {
          name: 'city',
          type: 'string'
        },
        {
          name: 'arr',
          type: 'uint256[]'
        },
        {
          name: 'obj',
          type: 'Type'
        }
      ],
      Type3: [
        {
          name: 'key',
          type: 'string'
        },
        {
          name: 'value',
          type: 'string'
        }
      ],
      Type4: [
        {
          name: 'name',
          type: 'string'
        },
        {
          name: 'age',
          type: 'uint256'
        },
        {
          name: 'isActive',
          type: 'bool'
        },
        {
          name: 'ethAddress',
          type: 'address'
        },
        {
          name: 'address',
          type: 'Type2'
        },
        {
          name: 'scores',
          type: 'uint256[]'
        },
        {
          name: 'preferences',
          type: 'Type3[]'
        },
        {
          name: 'arrAlt',
          type: 'Type[]'
        }
      ]
    }
    chai.expect(JSON.stringify(types) === JSON.stringify(newlyExpectedTypes), JSON.stringify(types, null, 2)).to.be.true // eslint-disable-line
  })
})
