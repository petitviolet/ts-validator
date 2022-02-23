# ts-validator

## Installation

[![npm version](https://badge.fury.io/js/@petitviolet%2Fts-validator.svg)](https://badge.fury.io/js/@petitviolet%2Fts-validator)

```
$ npm i @petitviolet/ts-validator
```

## Usage

```typescript
type Param = {
  name: string
  email: string
  age: number
}

// run sync/async validations on given arguments
const result = validate(
  {
    name: 'bob',
    email: 'bob@example.com',
    age: 120,
  },
  {
    name: [ // array of validators(name => boolean | Promise<boolean> return true if valid)
      [name => name.length > 0, 'must not be empty'],
      [async name => userRepository.findByName(name) === null, 'must be unique'],
    ],
    email: [
      [email => /^.+@.+$/i.test(email), 'must be in email format'],
      [async email => userRepository.findByEmail(email) === null, 'is already taken'],
    ],
    age: [
      [age => age > 0 && age < 120, 'must be between 0 and 120'],
    ],
  }
)
console.dir(result)
// {
//   valid: false,
//   errors: {
//     name: ['must be unique'],
//     email: ['is already taken'],
//     age: ['must be between 0 and 120'],
//   },
// }
```

See [tests](./test) files for more examples.

## LISENCE

MIT
