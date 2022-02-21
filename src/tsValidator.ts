import { rejectNullable } from './rejectNullable'

export type ValidationErrors<T> = { [key in keyof T]?: string[] }
type FixedValidationResult<T> =
  | { valid: true }
  | {
      valid: false
      errors: ValidationErrors<T>
    }

export type ValidationResult<T> = Promise<FixedValidationResult<T>>

type Validators<P> = {
  [key in keyof P]?:
    | [(v: P[key]) => boolean | Promise<boolean>, string][]
    | { allowNullable: boolean; funcs: [(v: NonNullable<P[key]>) => boolean | Promise<boolean>, string][] }
}

export const mergeValidationResults = <T>(results: FixedValidationResult<any>[]): FixedValidationResult<T> => {
  const errors = results.reduce<ValidationErrors<T>>((errors, result) => {
    if (result.valid) {
      return errors
    } else {
      return Object.entries<ValidationErrors<T>[keyof T]>(result.errors).reduce<ValidationErrors<T>>((acc, [key, errors]) => {
        return { ...acc, [key]: errors!.concat(acc[key as keyof T] || []) }
      }, errors)
    }
  }, {})

  if (Object.values(errors).length > 0) {
    return { valid: false, errors }
  } else {
    return { valid: true }
  }
}
export const validate = async <P>(param: P | P[], validators: Validators<P>): ValidationResult<P> => {
  const errors: { key: keyof P; errors: string[] }[] = (
    await Promise.all(
      (Array.isArray(param) ? param : [param]).flatMap(param => {
        return (Object.keys(param) as Readonly<keyof P>[]).map(async (key: keyof P) => {
          const value = param[key]
          const validator = validators[key]
          if (!validator) {
            return undefined
          }
          let validatorFuncs: [(v: typeof value) => boolean | Promise<boolean>, string][]
          if ('allowNullable' in validator) {
            if (!value) {
              if (validator.allowNullable) {
                return undefined
              } else {
                return { key, errors: ['must not be nullable'] }
              }
            }
            validatorFuncs = validator.funcs as typeof validatorFuncs
          } else {
            validatorFuncs = validator
          }
          const errors: string[] = (
            await Promise.all(
              validatorFuncs.map(async ([func, errorMessage]) => {
                const ok = await func(value)
                return ok ? undefined : errorMessage
              })
            )
          ).filter(rejectNullable)

          if (errors && errors.length > 0) {
            return { key, errors }
          } else {
            return undefined
          }
        })
      })
    )
  ).filter(rejectNullable)
  const aggregated = errors.reduce<ValidationErrors<P>>((acc, { key, errors }) => {
    return { ...acc, key: errors }
  }, {})

  if (Object.values(aggregated).length > 0) {
    return { valid: false, errors: aggregated }
  }
  return { valid: true }
}

export const notNullable = <T>(): [(t: T) => boolean, string] => {
  return [
    (t: T) => {
      if (t) return true
      else return false
    },
    'must not be nullable',
  ]
}
