import type { FixedValidationResult, ValidationErrors } from './@types'

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
