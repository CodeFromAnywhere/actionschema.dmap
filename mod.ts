export type RequestJson = {
  url: string;
  body?: string | object;
  /** defaults to post if body is given, get otherwise */
  method?: "GET" | "POST" | "DELETE" | "PUT" | "PATCH";
  headers?: { [name: string]: string };
};

/**
 * Distributed Map
 *
 * - Array must be JSON serialisable. If no mapFunction is passed, dmap will require the array to be an array of URLs or RequestJson's for it to be executed
 * - The map function (optional) must only use web standard APIs and must not use any variables outside of the scope, as it will be executed out-of-scope, in a foreign serverless environment,
 */
export const dmap = async <T, U = any>(
  config: { apiKey: string; basePath?: string },
  /** JSON serializable array */
  array: T[],
  /** Fully scoped map function.   */
  mapFn?: (item: T, index: number) => Promise<U> | U,
  /** Pass a logger to view updates */
  log?: (log: string) => void,
): Promise<
  { result: U; status: number; headers?: { [name: string]: string } }[]
> => {
  const defaultBasePath = "https://dmap.actionschema.com";

  const response = await fetch(config.basePath || defaultBasePath, {
    method: "POST",
    body: JSON.stringify({
      array,
      // This gives the string of dmap
      // The problem with this is that it only takes the argument itself, not the code it references to.
      // Because of this the function should never access anything outside of its own scope.
      code: mapFn?.toString(),
    }),
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      Accept: "text/event-stream",
    },
  });

  if (!response.ok) {
    throw new Error(`dmap failed: ${await response.text()}`);
  }

  const result: {
    result: U;
    status: number;
    headers: { [name: string]: string };
  }[] = await response.json();
  return result;
};
