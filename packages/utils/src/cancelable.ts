/**
 * Copyright © 2021 - 2024 Progyan Bhattacharya
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

import { ICancelable, ICancelableCollection } from "@otjs/types";

/** Cancelable Constructor */
export namespace Cancelable {
  /**
   * @internal
   * Creates a Cancelable instance from a Cleanup/Unsubscribe function.
   * @param fn - Cleanup/Unsubscribe function.
   */
  export function create(fn: () => void): ICancelable {
    return {
      cancel() {
        fn.apply(null);
      },
    };
  }
}

/**
 * @internal
 * Collection Class for Cancelable instances to handle cross-cutting concerns of abort.
 * @param cancelables - Comma separated Cancelable instances.
 */
export class CancelableCollection implements ICancelableCollection {
  protected _cancelables: ICancelable[] = [];

  constructor(...cancelables: ICancelable[]) {
    this.push(...cancelables);
  }

  get canceled(): boolean {
    return this._cancelables.length === 0;
  }

  push(...cancelables: ICancelable[]): void {
    this._cancelables.push(...cancelables);
  }

  forEach(callbackFn: (cancelable: ICancelable) => void): void {
    this._cancelables.forEach((cancelable) => callbackFn(cancelable));
  }

  cancel(): void {
    if (this.canceled) {
      return;
    }

    this._cancelables.forEach((cancelable) => cancelable.cancel());
    this._cancelables = [];
  }
}
