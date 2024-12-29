/** Distributed Map
 *
 * - Array must be JSON serialisable
 * - The map function must only use web standard APIs and must not use any variables outside of the scope, as it will be executed out-of-scope, in a foreign serverless environment,
 *
 */
export const dmap = async <T, U>(
  /** JSON serializable array */
  array: T[],
  /** Fully scoped map function.   */
  mapFn: (item: T, index: number) => Promise<U> | U,
  config: { apiKey: string; basePath?: string },
): Promise<U[]> => {
  const defaultBasePath = "https://dmap.actionschema.com";

  const response = await fetch(config.basePath || defaultBasePath, {
    method: "POST",
    body: JSON.stringify({
      array,
      // This gives the string of dmap
      // The problem with this is that it only takes the argument itself, not the code it references to.
      // Because of this the function should never access anything outside of its own scope.
      code: mapFn.toString(),
    }),
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`dmap failed: ${await response.text()}`);
  }

  const result: U[] = await response.json();
  return result;
};

const createDmap = <T, U>(
  apiKey: string,
  basePath?: string,
): ((
  array: T[],
  mapFn: (item: T, index: number) => Promise<U> | U,
) => Promise<U[]>) => {
  return (
    /** JSON serializable array */
    array: T[],
    /** Fully scoped map function.   */
    mapFn: (item: T, index: number) => Promise<U> | U,
  ) => dmap(array, mapFn, { apiKey, basePath });
};
export default createDmap;

// const fn = (n: number) => n * n;
// dmap([1, 2, 3, 4, 5], fn, { apiKey: "" });

// console.log(((n, index, array) => n * n)(1, 0, [1, 2, 3, 4, 5]));
