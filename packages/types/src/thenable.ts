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

/**
 * @internal
 * Promise-like interface to defer execution of certain methods or functions.
 */
export interface IThenable<T = unknown> {
  /** Attaches callbacks for the resolution of Thenable */
  then<N = unknown>(callbackFn: (value: T) => N): IThenable<N>;
}

/**
 * @internal
 * Interface for Collection Class for Thenable instances to handle cross-cutting concerns of Promise resolution.
 */
export interface IThenableCollection {
  /** Returns true if all Thenables are Resolved */
  resolved: boolean;
  /** Pushes Thenables to the collection */
  push(...thenables: IThenable[]): void;
  /** Pushes Thenable to execute post resolution of current collection */
  pushSync(thenableFn: () => IThenable): void;
  /** Returns a single Thenable instance to await resolution and resets the collection */
  all(): IThenable<PromiseSettledResult<unknown>[]>;
  /** Disposes all Theanbles in the collection and resets the collection */
  dispose(): void;
}
