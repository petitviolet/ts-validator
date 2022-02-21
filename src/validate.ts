import { rejectNullable } from './rejectNullable'
import type { FixedValidationResult, ValidationErrors, ValidationResult, Validators } from './types'

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
    return { ...acc, [key]: errors }
  }, {})

  if (Object.values(aggregated).length > 0) {
    return { valid: false, errors: aggregated }
  }
  return { valid: true }
}
