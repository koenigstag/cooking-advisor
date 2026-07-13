export function uid(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'id-' + Date.now() + '-' + Math.random().toString(16).slice(2);
}

export function pick<T extends object, K extends readonly (keyof T)[]>(
  obj: T,
  keys: K
): Pick<T, K[number]> {
  const result = {} as Pick<T, K[number]>;
  keys.forEach((k) => {
    if (k in obj) {
      result[k] = obj[k];
    }
  });
  return result;
}
