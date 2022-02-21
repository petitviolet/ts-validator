export const rejectNullable = <T>(item: T | void | null | undefined): item is T => {
  return Boolean(item)
}
