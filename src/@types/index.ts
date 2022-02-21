export declare type ValidationErrors<T> = { [key in keyof T]?: string[] }
export declare type FixedValidationResult<T> =
  | { valid: true }
  | {
      valid: false
      errors: ValidationErrors<T>
    }

export declare type ValidationResult<T> = Promise<FixedValidationResult<T>>

export declare type Sync<T> = T

export declare type SyncValidators<P> = Validators<P, Sync<boolean>>
// export declare type AsyncValidators<P> = Validators<P, Promise<boolean>>

export declare type Validators<P, F extends Sync<boolean> | Promise<boolean>> = {
  [key in keyof P]?:
    | [(v: P[key]) => boolean | F, string][]
    | { allowNullable: boolean; funcs: [(v: NonNullable<P[key]>) => boolean | F, string][] }
}
