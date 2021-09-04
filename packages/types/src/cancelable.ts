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
 * Cancelable Interface - Classes with side-effect should extend this interface to cancel the effects.
 * Applicable to the Interfaces/Objects that requires cleanup of any external side-effects.
 */
export interface ICancelable {
  /**
   * Cancel Method.
   */
  cancel(): void;
}

/**
 * @internal
 * Interface for Collection Class for Cancelable instances to handle cross-cutting concerns of abort.
 */
export interface ICancelableCollection {
  /** Returns true if all Cancelables are Canceled */
  canceled: boolean;
  /** Pushes Cancelables to the collection */
  push(...cancelables: ICancelable[]): void;
  /** Executes a callback function over each Cancelable in the collection */
  forEach(callbackFn: (cancelable: ICancelable) => void): void;
  /** Cancels all Cancelables in the collection and resets the collection */
  cancel(): void;
}
