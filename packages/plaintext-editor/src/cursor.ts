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

import { IPlainTextOperation } from "@ot/plaintext";

/**
 * @public
 * JSON Representation of a Cursor Object
 *
 * If `position` and `selectionEnd` are equal that means
 * a single cursor; otherwise, it's a selection between
 * two points.
 */
export type TCursor = {
  /** Starting Position of the Cursor/Selection */
  position: number;
  /** Final Position of the Selection */
  selectionEnd: number;
};

/**
 * @public
 * A cursor has a `position` and a `selectionEnd`. Both are zero-based indexes
 * into the document. When nothing is selected, `selectionEnd` is equal to
 * `position`. When there is a selection, `position` is always the side of the
 * selection that would move if you pressed an arrow key.
 */
export interface ICursor {
  /**
   * Checks if two Cursor are at same position.
   * @param other - Another Cursor Object (could be null).
   */
  equals(other: ICursor | null): boolean;
  /**
   * Return the more current cursor information.
   * @param other - Another Cursor Object.
   */
  compose(other: ICursor): ICursor;
  /**
   * Update the cursor with respect to an operation.
   * @param operation - Text Operation.
   */
  transform(operation: IPlainTextOperation): ICursor;
  /**
   * Returns String representation of a Cursor.
   */
  toString(): string;
  /**
   * Returns JSON representation of a Cursor.
   */
  toJSON(): TCursor;
  /**
   * Returns Serializable set of Primitive value of a Cursor.
   */
  valueOf(): [number, number];
}
