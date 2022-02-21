export const notNullable = <T>(): [(t: T) => boolean, string] => {
  return [
    (t: T) => {
      if (t) return true
      else return false
    },
    'must not be nullable',
  ]
}
