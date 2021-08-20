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

import { NoopError } from "@ot/utils";
import { ITextOperation, TTextOperationAttributes } from "./operation";

/**
 * @internal
 * Retain Operation - Move Cursor over without changing the content.
 *
 * @param characterCount - Number of characters to move over.
 * @param attributes - Additional Metadata attached with Retain operation.
 */
export class RetainOperation implements ITextOperation {
  protected _characterCount: number;
  protected readonly _attributes: TTextOperationAttributes | null;

  constructor(
    characterCount: number,
    attributes: TTextOperationAttributes | null = null
  ) {
    this._attributes = attributes;
    this._characterCount = characterCount;
  }

  isInsert(): boolean {
    return false;
  }

  isDelete(): boolean {
    return false;
  }

  isRetain(): boolean {
    return true;
  }

  equals(other: ITextOperation): boolean {
    return (
      other.isRetain() &&
      other.attributesEqual(this._attributes) &&
      other.characterCountEqual(this._characterCount)
    );
  }

  attributesEqual(otherAttributes: TTextOperationAttributes | null): boolean {
    if (otherAttributes == null || this._attributes == null) {
      return this._attributes == otherAttributes;
    }

    for (const attr in this._attributes) {
      if (this._attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    for (const attr in otherAttributes) {
      if (this._attributes[attr] !== otherAttributes[attr]) {
        return false;
      }
    }

    return true;
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
    throw new NoopError("Can not add text to retain operation.");
  }

  setTextContent(_text: string): void {
    throw new NoopError("Can not add text to retain operation.");
  }

  characterCount(): number {
    return this._characterCount;
  }

  textContent(): string {
    throw new NoopError("Can get text from retain operation.");
  }

  hasEmptyAttributes(): boolean {
    if (this._attributes == null) {
      return true;
    }

    return Object.keys(this._attributes).length === 0;
  }

  getAttributes(): TTextOperationAttributes {
    return Object.assign({}, this._attributes);
  }

  toString(): string {
    return `RETAIN ${this._characterCount}`;
  }

  valueOf(): number {
    return this._characterCount;
  }
}
