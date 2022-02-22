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

const result = validate(
  {
    name: 'bob',
    email: 'bob@example.com',
    age: 120,
  },
  {
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
