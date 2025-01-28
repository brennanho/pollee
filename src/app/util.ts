export function assertDefined<T extends object>(obj: T, keys: (keyof T)[]): void {
  keys.forEach((key) => {
    if (obj[key] === undefined) {
      throw new Error(`Missing or undefined required property: ${String(key)}`);
    }
  });
}
