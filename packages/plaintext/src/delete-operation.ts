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

import { NoopError } from "@otjs/utils";
import { ITextOperation, TTextOperationAttributes } from "./operation";

/**
 * @internal
 * Delete Operation - Delete Characters starting from current Cursor position in the content.
 *
 * @param characterCount - Number of characters to Delete.
 * @param attributes - Additional Metadata attached with Delete operation.
 */
export class DeleteOperation implements ITextOperation {
  protected _characterCount: number;

  constructor(characterCount: number) {
    this._characterCount = characterCount;
  }

  isInsert(): boolean {
    return false;
  }

  isDelete(): boolean {
    return true;
  }

  isRetain(): boolean {
    return false;
  }

  equals(other: ITextOperation): boolean {
    return other.isDelete() && other.characterCountEqual(this._characterCount);
  }

  attributesEqual(_otherAttributes: TTextOperationAttributes | null): boolean {
    throw new NoopError("Delete operation does not have any attributes.");
  }

  characterCountEqual(characterCount: number): boolean {
    return this._characterCount === characterCount;
  }

  textContentEqual(_text: string): boolean {
    return false;
  }

  addCharacterCount(characterCount: number): void {
    this._characterCount += characterCount;
  }

  addTextContent(_text: string): void {
    throw new NoopError("Can not add text to delete operation.");
  }

  setTextContent(_text: string): void {
    throw new NoopError("Can not add text to delete operation.");
  }

  characterCount(): number {
    return this._characterCount;
  }

  textContent(): string {
    throw new NoopError("Can get text from delete operation.");
  }

  hasEmptyAttributes(): boolean {
    return true;
  }

  getAttributes(): TTextOperationAttributes | null {
    return null;
  }

  toString(): string {
    return `DELETE ${this._characterCount}`;
  }

  valueOf(): number {
    return -this._characterCount;
  }
}
