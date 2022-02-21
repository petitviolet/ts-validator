export type ValidationErrors<T> = { [key in keyof T]?: string[] }
export type FixedValidationResult<T> =
  | { valid: true }
  | {
      valid: false
      errors: ValidationErrors<T>
    }

export type ValidationResult<T> = Promise<FixedValidationResult<T>>

export type Validators<P> = {
  [key in keyof P]?:
    | [(v: P[key]) => boolean | Promise<boolean>, string][]
    | { allowNullable: boolean; funcs: [(v: NonNullable<P[key]>) => boolean | Promise<boolean>, string][] }
}
