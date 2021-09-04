/**
 * Copyright © 2021 Progyan Bhattacharya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See LICENSE file in the root directory for more details.
 */

import {
  IMemoizedFunction,
  Primitive,
} from "@operational-transformation/types";

/**
 * @internal
 * Default resolver function for memoize.
 * @param key - First Parameter of Function call expression.
 * @returns Returns first parameter as is if it is a Primitive value, else null is returned.
 */
function _defaultResolver(key: any): Primitive | null {
  if (key == null || typeof key === "object") {
    return null;
  }

  return key;
}

/**
 * @internal
 * Creates a function that memoizes the result of `fn`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `fn`
 * is invoked with the `this` binding of the memoized function.
 *
 * @param fn - The function to have its output memoized.
 * @param resolver - The function to resolve the cache key. It will always
 * invoke `func` if key is found to be `null`.
 * @returns Returns the new memoized function with IDisposable interface.
 */
export function memoize<T extends Function>(
  fn: T,
  resolver: (...args: any[]) => Primitive | null = _defaultResolver
): T & IMemoizedFunction {
  let map: Map<Primitive, unknown> | null;

  const memoizedFn = (...args: any[]): unknown => {
    const cache: Map<Primitive, unknown> = map || new Map();
    const key: Primitive | null = resolver(...args);

    if (key !== null && cache.has(key)) {
      return cache.get(key);
    }

    const val = fn(...args);

    if (key !== null) {
      cache.set(key, val);
    }

    map ||= cache;
    return val;
  };

  memoizedFn.dispose = () => {
    if (map == null) {
      return;
    }

    map.clear();
    map = null;
  };

  // @ts-expect-error
  return memoizedFn;
}
