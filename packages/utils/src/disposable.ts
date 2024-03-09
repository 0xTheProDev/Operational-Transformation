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

import { IDisposable, IDisposableCollection } from "@otjs/types";

/** Disposable Constructor */
export namespace Disposable {
  /**
   * @internal
   * Creates a Disposable instance from a Cleanup/Unsubscribe function.
   * @param fn - Cleanup/Unsubscribe function.
   */
  export function create(fn: () => void): IDisposable {
    return {
      dispose() {
        fn.apply(null);
      },
    };
  }
}

/**
 * @internal
 * Collection Class for Disposable instances to handle cross-cutting concerns of cleanup.
 * @param disposables - Comma separated Disposable instances.
 */
export class DisposableCollection implements IDisposableCollection {
  protected _disposables: IDisposable[] = [];

  constructor(...disposables: IDisposable[]) {
    this.push(...disposables);
  }

  get disposed(): boolean {
    return this._disposables.length === 0;
  }

  push(...disposables: IDisposable[]): void {
    this._disposables.push(...disposables);
  }

  dispose(): void {
    if (this.disposed) {
      return;
    }

    this._disposables.forEach((disposable) => disposable.dispose());
    this._disposables = [];
  }
}
