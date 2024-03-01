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

import { IPlainTextOperation } from "@otjs/plaintext";
import { ICursor } from "./cursor";
import { IOperationMetadata } from "./operation-metadata";

/**
 * @intenal
 * Metadata (e.g., cursor position) about a Plain Text Operation
 * @param cursorBefore - Cursor position before Text Operation is applied
 * @param cursorAfter - Cursor position after Text Operation is applied
 */
export class OperationMetadata implements IOperationMetadata {
  protected readonly _cursorBefore: ICursor | null;
  protected readonly _cursorAfter: ICursor | null;

  constructor(cursorBefore: ICursor | null, cursorAfter: ICursor | null) {
    this._cursorBefore = cursorBefore;
    this._cursorAfter = cursorAfter;
  }

  clone(): IOperationMetadata {
    return new OperationMetadata(this._cursorBefore, this._cursorAfter);
  }

  invert(): IOperationMetadata {
    return new OperationMetadata(this._cursorAfter, this._cursorBefore);
  }

  compose(other: OperationMetadata): IOperationMetadata {
    return new OperationMetadata(this._cursorBefore, other._cursorAfter);
  }

  transform(operation: IPlainTextOperation): IOperationMetadata {
    return new OperationMetadata(
      this._cursorBefore ? this._cursorBefore.transform(operation) : null,
      this._cursorAfter ? this._cursorAfter.transform(operation) : null,
    );
  }

  getCursor(): ICursor | null {
    return this._cursorAfter;
  }
}
