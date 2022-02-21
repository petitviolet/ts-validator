import { FixedValidationResult, validate } from '../src/index'

describe('validate async', () => {
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
      {
        name: [
          [name => name.length > 0, 'must not be empty'],
          [async name => !['bob', 'charlie'].includes(name), 'must be unique'],
        ],
        email: [
          [email => email.length > 0, 'must not be empty'],
          [email => /^.+@.+$/i.test(email), 'must be in email format'],
        ],
        age: [[age => age > 0 && age < 120, 'must be between 0 and 120']],
      }
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
      {
        name: [
          [name => name.length > 0, 'must not be empty'],
          [async name => !['bob', 'charlie'].includes(name), 'must be unique'],
        ],
        email: [
          [email => email.length > 0, 'must not be empty'],
          [email => /^.+@.+$/i.test(email), 'must be in email format'],
        ],
        age: [[age => age > 0 && age < 120, 'must be between 0 and 120']],
      }
    )
    expect(result.valid).toBeFalsy()
    if (result.valid !== false) {
      return
    }
    expect(result.errors).toEqual({
      name: ['must be unique'],
      email: ['must not be empty', 'must be in email format'],
      age: ['must be between 0 and 120'],
    })
  })
})
