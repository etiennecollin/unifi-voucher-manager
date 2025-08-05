export function map<T, U>(value: T | null, fn: (v: T) => U): U | null {
  /**
   * Returns the result of applying fn to value if value is non-null, otherwise returns null.
   */
  return value != null ? fn(value) : null;
}
