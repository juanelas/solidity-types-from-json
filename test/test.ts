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
  // With the default canonicalize=true, keys of every object are sorted
  // lexicographically before type inference. This makes the schema a function
  // of the SEMANTIC object (not the source key order).
  const expectedTypes = {
    Obj: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
    Address: [
      { name: 'arr', type: 'uint256[]' },
      { name: 'city', type: 'string' },
      { name: 'obj', type: 'Obj' },
      { name: 'street', type: 'string' }
    ],
    ArrAltItem: [{ name: 'a', type: 'uint256' }, { name: 'b', type: 'bool' }],
    Preference: [
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' }
    ],
    Type: [
      { name: 'address', type: 'Address' },
      { name: 'age', type: 'uint256' },
      { name: 'arrAlt', type: 'ArrAltItem[]' },
      { name: 'ethAddress', type: 'address' },
      { name: 'isActive', type: 'bool' },
      { name: 'name', type: 'string' },
      { name: 'preferences', type: 'Preference[]' },
      { name: 'scores', type: 'uint256[]' }
    ]
  }
  it('should return the expected types (default canonicalize=true)', function () {
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
        { name: 'a', type: 'uint256' },
        { name: 'b', type: 'bool' }
      ],
      Type2: [
        { name: 'arr', type: 'uint256[]' },
        { name: 'city', type: 'string' },
        { name: 'obj', type: 'Type' },
        { name: 'street', type: 'string' }
      ],
      Type3: [
        { name: 'key', type: 'string' },
        { name: 'value', type: 'string' }
      ],
      Type4: [
        { name: 'address', type: 'Type2' },
        { name: 'age', type: 'uint256' },
        { name: 'arrAlt', type: 'Type[]' },
        { name: 'ethAddress', type: 'address' },
        { name: 'isActive', type: 'bool' },
        { name: 'name', type: 'string' },
        { name: 'preferences', type: 'Type3[]' },
        { name: 'scores', type: 'uint256[]' }
      ]
    }
    chai.expect(JSON.stringify(types) === JSON.stringify(newlyExpectedTypes), JSON.stringify(types, null, 2)).to.be.true // eslint-disable-line
  })

  describe('canonicalization', function () {
    it('should preserve insertion order when canonicalize=false (backward-compatible)', function () {
      const { types } = jsonToSolidityTypes(exampleObject, { canonicalize: false })
      const legacyExpectedTypes = {
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
      chai.expect(JSON.stringify(types) === JSON.stringify(legacyExpectedTypes), JSON.stringify(types, null, 2)).to.be.true // eslint-disable-line
    })

    it('should produce identical schemas for semantically-equal objects with different key order', function () {
      const a = { alpha: 1, beta: 2, gamma: { x: 'y', z: true } }
      const b = { gamma: { z: true, x: 'y' }, beta: 2, alpha: 1 }
      const ra = jsonToSolidityTypes(a)
      const rb = jsonToSolidityTypes(b)
      chai.expect(JSON.stringify(ra)).to.equal(JSON.stringify(rb)) // eslint-disable-line
    })

    it('should produce DIFFERENT schemas for reshuffled keys when canonicalize=false', function () {
      const a = { alpha: 1, beta: 2 }
      const b = { beta: 2, alpha: 1 }
      const ra = jsonToSolidityTypes(a, { canonicalize: false })
      const rb = jsonToSolidityTypes(b, { canonicalize: false })
      chai.expect(JSON.stringify(ra)).to.not.equal(JSON.stringify(rb)) // eslint-disable-line
    })
  })

  describe('number / bigint handling', function () {
    it('should accept bigint within [0, 2^256 - 1] as uint256', function () {
      const max = (1n << 256n) - 1n
      const { types } = jsonToSolidityTypes({ n: max })
      chai.expect(types.Type[0].type).to.equal('uint256') // eslint-disable-line
    })

    it('should reject bigint larger than 2^256 - 1', function () {
      const overflow = 1n << 256n
      chai.expect(() => jsonToSolidityTypes({ n: overflow })).to.throw(/uint256 maximum/) // eslint-disable-line
    })

    it('should reject negative bigint', function () {
      chai.expect(() => jsonToSolidityTypes({ n: -1n })).to.throw(/Negative bigint/) // eslint-disable-line
    })

    it('should reject negative Number', function () {
      chai.expect(() => jsonToSolidityTypes({ n: -1 })).to.throw(/Negative numbers/) // eslint-disable-line
    })

    it('should reject Number values above Number.MAX_SAFE_INTEGER', function () {
      chai.expect(() => jsonToSolidityTypes({ n: Number.MAX_SAFE_INTEGER + 2 })).to.throw(/MAX_SAFE_INTEGER/) // eslint-disable-line
    })

    it('should reject NaN and Infinity', function () {
      chai.expect(() => jsonToSolidityTypes({ n: NaN })).to.throw(/Non-finite/) // eslint-disable-line
      chai.expect(() => jsonToSolidityTypes({ n: Infinity })).to.throw(/Non-finite/) // eslint-disable-line
    })
  })

  describe('unsupported values', function () {
    it('should reject nested null', function () {
      chai.expect(() => jsonToSolidityTypes({ x: null })).to.throw(/null/) // eslint-disable-line
    })

    it('should reject nested undefined', function () {
      chai.expect(() => jsonToSolidityTypes({ x: undefined })).to.throw(/undefined/) // eslint-disable-line
    })

    it('should reject Date (non-plain object)', function () {
      chai.expect(() => jsonToSolidityTypes({ when: new Date() })).to.throw(/non-plain object/) // eslint-disable-line
    })

    it('should reject top-level null / array / primitive', function () {
      chai.expect(() => jsonToSolidityTypes(null as any)).to.throw(/JSON/) // eslint-disable-line
      chai.expect(() => jsonToSolidityTypes([] as any)).to.throw(/JSON/) // eslint-disable-line
      chai.expect(() => jsonToSolidityTypes('x' as any)).to.throw(/JSON/) // eslint-disable-line
    })

    it('should reject top-level class instance (non-plain object)', function () {
      class Foo { x = 1 }
      chai.expect(() => jsonToSolidityTypes(new Foo() as any)).to.throw(/JSON/) // eslint-disable-line
    })
  })

  describe('Unicode NFC normalization of keys', function () {
    // "café" precomposed (U+00E9) vs decomposed (e + U+0301). These parse as two
    // distinct JS strings, but are semantically the same user-visible key.
    const composed = 'café'
    const decomposed = 'café'

    it('should produce identical schemas for NFC-equivalent keys', function () {
      const a = { [composed]: 1 }
      const b = { [decomposed]: 1 }
      chai.expect(JSON.stringify(jsonToSolidityTypes(a))).to.equal(JSON.stringify(jsonToSolidityTypes(b))) // eslint-disable-line
    })

    it('should emit the NFC form in the type definition', function () {
      const { types } = jsonToSolidityTypes({ [decomposed]: 1 })
      chai.expect(types.Type[0].name).to.equal(composed) // eslint-disable-line
    })

    it('should throw when NFC normalization would collide two distinct keys', function () {
      const obj: Record<string, any> = {}
      obj[composed] = 1
      obj[decomposed] = 2
      chai.expect(() => jsonToSolidityTypes(obj)).to.throw(/NFC/) // eslint-disable-line
    })
  })

  describe('addType collision bound', function () {
    it('should throw if more than MAX_TYPE_NAME_PROBES distinct shapes collide on a name', function () {
      // Build an object whose children all normalize to the same key-derived
      // type name ("Item") but have structurally distinct shapes. We wedge them
      // into distinct parent keys that pluralize / singularize to "item".
      // Simpler: use canonicalize=false and getTypeNamesFromKeyValues=false so
      // every nested struct competes for the base name "Type".
      const obj: Record<string, any> = {}
      for (let i = 0; i < 1001; i++) {
        // each child has a different number of uint256 fields => distinct shape
        const child: Record<string, number> = {}
        for (let j = 0; j <= i; j++) child[`f${j}`] = j
        obj[`k${i}`] = child
      }
      chai.expect(() => jsonToSolidityTypes(obj, { getTypeNamesFromKeyValues: false })).to.throw(/probes/) // eslint-disable-line
    })
  })
})
