/** Distributed Map */
export const dmap = async <T, U>(
  /** JSON serializable array */
  array: T[],
  /**
   * Fully scoped map function.
   * NB: ensure you don't use any variables outside of the scope of the function or this will not work!
   */
  mapFn: (item: T, index: number) => Promise<U> | U,
  config: { apiKey: string },
): Promise<U[]> => {
  const data = {
    array,
    // This gives the string of dmap
    // The problem with this is that it only takes the argument itself, not the code it references to.
    // Because of this the function should never access anything outside of its own scope.
    code: mapFn.toString(),
  };
  const localhost = "http://localhost:3000";
  const host = "https://dmap.actionschema.com";
  const response = await fetch(host, {
    method: "POST",
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${config.apiKey}` },
  });

  if (!response.ok) {
    throw new Error(`dmap failed: ${await response.text()}`);
  }

  const result: U[] = await response.json();
  return result;
};

// const fn = (n: number) => n * n;
// dmap([1, 2, 3, 4, 5], fn, { apiKey: "" });

// console.log(((n, index, array) => n * n)(1, 0, [1, 2, 3, 4, 5]));
