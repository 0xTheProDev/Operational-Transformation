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
import { ICursor } from "./cursor";

/**
 * @internal
 * Metadata (e.g., cursor position) about a Plain Text Operation
 */
export interface IOperationMetadata {
  /**
   * Return shallow clone of Operation Metadata
   */
  clone(): IOperationMetadata;
  /**
   * Return updated Operation Metadata on Inversion of Operation
   */
  invert(): IOperationMetadata;
  /**
   * Return updated Operation Metadata on Composition of Operation
   * @param other - Operation Metadata from other operation
   */
  compose(other: IOperationMetadata): IOperationMetadata;
  /**
   * Return updated Operation Metadata on Transformation of Operation
   * @param operation - Text Operation.
   */
  transform(operation: IPlainTextOperation): IOperationMetadata;
  /**
   * Returns final state of Cursor
   */
  getCursor(): ICursor | null;
}
