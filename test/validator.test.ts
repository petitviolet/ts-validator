import { FixedValidationResult, Sync, validate, Validators } from '../src/index'

type Param = {
  name: string
  email: string
  age: number
}
const validatorsSync: Validators<Param, Sync<boolean>> = {
  name: [[name => name.length > 0, 'must not be empty']],
  email: [[email => /^.+@.+$/i.test(email), 'must be in email format']],
  age: [[age => age > 0 && age < 120, 'must be between 0 and 120']],
}
const sleep = (seconds: number) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000))
}
const validatorsAsync: Validators<Param, Sync<boolean> | Promise<boolean>> = {
  name: [
    [name => name.length > 0, 'must not be empty'],
    [name => sleep(1).then(() => !['bob', 'charlie'].includes(name)), 'must be unique'],
  ],
  email: [
    [email => /^.+@.+$/i.test(email), 'must be in email format'],
    [email => sleep(1).then(() => !['bob@example.com', 'charlie@example.com'].includes(email)), 'is already taken'],
  ],
  age: [
    [age => age > 0 && age < 120, 'must be between 0 and 120'],
    [age => sleep(1).then(() => age % 2 === 0), 'must be even'],
  ],
}

describe('validate sync', () => {
  it('returns success results', async () => {
    type Param = {
      name: string
      email: string
      age: number
    }
    const result = await validate<Param>(
      {
        name: 'alice',
        email: 'alice@example.com',
        age: 20,
      },
      validatorsSync
    )
    expect(result.valid).toBeTruthy()
  })

  it('returns failure results', async () => {
    type Param = {
      name: string
      email: string
      age: number
    }
    const result: FixedValidationResult<Param> = await validate<Param>(
      {
        name: 'bob',
        email: '',
        age: 120,
      },
      validatorsSync
    )
    expect(result.valid).toBeFalsy()
    if (result.valid !== false) {
      return
    }
    expect(result.errors).toEqual({
      email: ['must be in email format'],
      age: ['must be between 0 and 120'],
    })
  })
})

describe('validate sync and async', () => {
  it('returns success results', async () => {
    type Param = {
      name: string
      email: string
      age: number
    }
    const result = await validate<Param>(
      {
        name: 'alice',
        email: 'alice@example.com',
        age: 20,
      },
      validatorsAsync
    )
    expect(result.valid).toBeTruthy()
  })

  it('returns failure results', async () => {
    type Param = {
      name: string
      email: string
      age: number
    }
    const result: FixedValidationResult<Param> = await validate<Param>(
      {
        name: 'bob',
        email: 'bob@example.com',
        age: 120,
      },
      validatorsAsync
    )
    expect(result.valid).toBeFalsy()
    if (result.valid !== false) {
      return
    }
    expect(result.errors).toEqual({
      name: ['must be unique'],
      email: ['is already taken'],
      age: ['must be between 0 and 120'],
    })
  })
})
