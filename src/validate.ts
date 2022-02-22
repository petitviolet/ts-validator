import { rejectNullable } from './rejectNullable'
import type { FixedValidationResult, Sync, ValidationErrors, ValidationResult, Validators } from './@types'

// Looking for a way to merge sync/async implementations...

export const validateSync = <P>(param: P | P[], validators: Validators<P, Sync<boolean>>): FixedValidationResult<P> => {
  const errors: { key: keyof P; errors: string[] }[] = (Array.isArray(param) ? param : [param])
    .flatMap(param => {
      return (Object.keys(param) as Readonly<keyof P>[]).map((key: keyof P) => {
        const value = param[key]
        const validatorFuncs = getValidatorFuncs(key, value, validators[key])
        if (!Array.isArray(validatorFuncs)) {
          return validatorFuncs
        }
        const errors: string[] = validatorFuncs
          .map(([func, errorMessage]) => {
            const ok = func(value)
            return ok ? undefined : errorMessage
          })
          .filter(rejectNullable)

        if (errors && errors.length > 0) {
          return { key, errors }
        } else {
          return undefined
        }
      })
    })
    .filter(rejectNullable)

  return aggregate(errors)
}

export const validate = async <P>(param: P | P[], validators: Validators<P, Sync<boolean> | Promise<boolean>>): ValidationResult<P> => {
  const errors: { key: keyof P; errors: string[] }[] = (
    await Promise.all(
      (Array.isArray(param) ? param : [param]).flatMap(param => {
        return (Object.keys(param) as Readonly<keyof P>[]).map(async (key: keyof P) => {
          const value = param[key]
          const validatorFuncs = getValidatorFuncs(key, value, validators[key])
          if (!Array.isArray(validatorFuncs)) {
            return validatorFuncs
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
  return aggregate(errors)
}

const aggregate = <P>(errors: { key: keyof P; errors: string[] }[]): { valid: true } | { valid: false; errors: ValidationErrors<P> } => {
  const aggregated = errors.reduce<ValidationErrors<P>>((acc, { key, errors }) => {
    return { ...acc, [key]: errors }
  }, {})

  if (Object.values(aggregated).length > 0) {
    return { valid: false, errors: aggregated }
  }
  return { valid: true }
}

const getValidatorFuncs = <P>(
  key: keyof P,
  value: P[keyof P],
  validator: Validators<P, Sync<boolean> | Promise<boolean>>[keyof P] | undefined
): undefined | { key: keyof P; errors: string[] } | [(v: typeof value) => boolean | Promise<boolean>, string][] => {
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
    validatorFuncs = validator.funcs as typeof validatorFuncs // to cast T to NoNullable<T>
  } else {
    validatorFuncs = validator // as typeof validatorFuncs
  }
  return validatorFuncs
}
