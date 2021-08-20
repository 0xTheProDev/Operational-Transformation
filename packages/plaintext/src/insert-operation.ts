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

import { NoopError } from "../../utils/src";
import { ITextOperation, TTextOperationAttributes } from "./operation";

/**
 * @internal
 * Insert Operation - Insert Characters starting from current Cursor position in the content.
 *
 * @param text - Text content to be Inserted.
 * @param attributes - Additional Metadata attached with Insert operation.
 */
export class InsertOperation implements ITextOperation {
  protected _text: string;
  protected readonly _attributes: TTextOperationAttributes | null;

  constructor(
    text: string,
    attributes: TTextOperationAttributes | null = null
  ) {
    this._attributes = attributes;
    this._text = text;
  }

  isInsert(): boolean {
    return true;
  }

  isDelete(): boolean {
    return false;
  }

  isRetain(): boolean {
    return false;
  }

  equals(other: ITextOperation): boolean {
    return (
      other.isInsert() &&
      other.attributesEqual(this._attributes) &&
      other.textContentEqual(this._text)
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

  characterCountEqual(_characterCount: number): boolean {
    return false;
  }

  textContentEqual(text: string): boolean {
    return this._text === text;
  }

  addCharacterCount(_characterCount: number): void {
    throw new NoopError("Can not add character count to insert operation.");
  }

  addTextContent(text: string): void {
    this._text += text;
  }

  setTextContent(text: string): void {
    this._text = text;
  }

  characterCount(): number {
    throw new NoopError("Can get character count from insert operation.");
  }

  textContent(): string {
    return this._text;
  }

  hasEmptyAttributes(): boolean {
    if (this._attributes == null) {
      return true;
    }

    return Object.keys(this._attributes).length === 0;
  }

  getAttributes(): TTextOperationAttributes | null {
    return Object.assign({}, this._attributes);
  }

  toString(): string {
    return `INSERT "${this._text}"`;
  }

  valueOf(): string {
    return this._text;
  }
}
