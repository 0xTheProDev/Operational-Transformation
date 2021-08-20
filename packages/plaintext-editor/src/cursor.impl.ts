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

import { ITextOperation, IPlainTextOperation } from "@ot/plaintext";
import { ICursor, TCursor } from "./cursor";

/**
 * @public
 * A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
 * into the document. When nothing is selected, `selectionEnd` is equal to
 * `position`. When there is a selection, `position` is always the side of the
 * selection that would move if you pressed an arrow key.
 *
 * @param position - Starting position of the Cursor
 * @param selectionEnd - Ending position of the Cursor
 */
export class Cursor implements ICursor {
  protected readonly _position: number;
  protected readonly _selectionEnd: number;

  constructor(position: number, selectionEnd: number) {
    this._position = position;
    this._selectionEnd = selectionEnd;
  }

  /**
   * Converts a JSON representation of Cursor into Cursor Object
   */
  static fromJSON({ position, selectionEnd }: TCursor): Cursor {
    return new Cursor(position, selectionEnd);
  }

  equals(other: Cursor | null): boolean {
    if (other == null) {
      return false;
    }

    return (
      this._position === other._position &&
      this._selectionEnd === other._selectionEnd
    );
  }

  compose(other: Cursor): Cursor {
    return other;
  }

  /**
   * Returns next starting position of the cursor based on incoming operations and current position.
   * @param operation - Plain Text Operation.
   * @param index - Current Position of the Cursor.
   */
  protected _transformIndex(operation: IPlainTextOperation, index: number) {
    const ops = operation.entries();

    let newIndex = index;
    let opValue: IteratorResult<[number, ITextOperation]>;

    while (!(opValue = ops.next()).done) {
      const op: ITextOperation = opValue.value[1];

      switch (true) {
        case op.isDelete():
          newIndex -= Math.min(index, op.characterCount());
          index -= op.characterCount();
          break;

        case op.isInsert():
          newIndex += op.textContent().length;
          break;

        case op.isRetain():
          index -= op.characterCount();
          break;
      }

      if (index < 0) {
        break;
      }
    }

    return newIndex;
  }

  transform(operation: IPlainTextOperation): Cursor {
    const newPosition: number = this._transformIndex(operation, this._position);

    if (this._position === this._selectionEnd) {
      return new Cursor(newPosition, newPosition);
    }

    return new Cursor(
      newPosition,
      this._transformIndex(operation, this._selectionEnd)
    );
  }

  toString(): string {
    if (this._position === this._selectionEnd) {
      return `Cursor: ${this._position}`;
    }

    return `Selection: [${this._position}, ${this._selectionEnd}]`;
  }

  toJSON(): TCursor {
    return {
      position: this._position,
      selectionEnd: this._selectionEnd,
    };
  }

  valueOf(): [number, number] {
    return [this._position, this._selectionEnd];
  }
}
