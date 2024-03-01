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

import { IThenable, IThenableCollection } from "@otjs/types";

/**
 * @internal
 * Collection Class for Thenable instances to handle cross-cutting concerns of Promise resolution.
 * @param thenables - Comma separated Thenable instances.
 */
export class ThenableCollection implements IThenableCollection {
  protected _thenables: IThenable[] = [];

  constructor(...thenables: IThenable[]) {
    this.push(...thenables);
  }

  get resolved(): boolean {
    return this._thenables.length === 0;
  }

  push(...thenables: IThenable[]): void {
    this._thenables.push(
      ...thenables.map((thenable) => Promise.resolve(thenable)),
    );
  }

  pushSync(thenableFn: () => IThenable): void {
    const pastThenables = Promise.allSettled(this._thenables);
    this._thenables = [pastThenables.then(() => Promise.resolve(thenableFn()))];
  }

  all(): IThenable<PromiseSettledResult<unknown>[]> {
    const batchThenables = Promise.allSettled(this._thenables);
    this._thenables = [];
    return batchThenables;
  }

  dispose(): void {
    this._thenables = [];
  }
}
