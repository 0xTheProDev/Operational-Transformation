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

/**
 * @public
 * Additional Metadata Data Type for Text Operation
 */
export type TTextOperationAttributeValue = number | boolean | string | symbol;

/**
 * @public
 * Additional Metadata Set for Text Operation
 */
export type TTextOperationAttributes = Record<
  string,
  TTextOperationAttributeValue
>;

/**
 * @public
 * Text Operation are essentially lists of ops. There are three types of operations:
 *
 * **Retain ops:** Advance the cursor position by a given number of characters.
 * Represented by positive ints.
 *
 * **Insert ops:** Insert a given string at the current cursor position.
 * Represented by strings.
 *
 * **Delete ops:** Delete the next n characters. Represented by negative ints.
 */
export interface ITextOperation {
  /**
   * Tests if it's an Insert Operation.
   */
  isInsert(): boolean;
  /**
   * Tests if it's a Delete Operation.
   */
  isDelete(): boolean;
  /**
   * Tests if it's a Retain Operation.
   */
  isRetain(): boolean;
  /**
   * Tests if two Individual Text Operation equal or not.
   * @param other - Another Text Operation.
   */
  equals(other: ITextOperation): boolean;
  /**
   * Tests if two Individual Text Operation have same Attributes or not.
   * @param otherAttributes - Another Text Operation Attributes.
   */
  attributesEqual(
    otherAttributes: TTextOperationAttributes | null | void
  ): boolean;
  /**
   * Tests if two Individual Text Operation have same Character Count or not.
   * @param characterCount - Another Text Operation Character Count.
   */
  characterCountEqual(characterCount: number): boolean;
  /**
   * Tests if two Individual Text Operation have same Text Content or not.
   * @param text - Another Text Operation Text Content.
   */
  textContentEqual(text: string): boolean;
  /**
   * Adds Character Count to current operation.
   * @param characterCount - Character Count to add.
   */
  addCharacterCount(characterCount: number): void;
  /**
   * Adds Text Content to current operation.
   * @param text - Text Content to add.
   */
  addTextContent(text: string): void;
  /**
   * Sets Text Content to current operation.
   * @param text - Text Content to add.
   */
  setTextContent(text: string): void;
  /**
   * Returns Character Count of current operation.
   * @param characterCount - Character Count to add.
   */
  characterCount(): number;
  /**
   * Returns Text Content of current operation.
   */
  textContent(): string;
  /**
   * Tests if this Individual Text Operation has additional Attributes.
   */
  hasEmptyAttributes(): boolean;
  /**
   * Returns additional Metadata of a Text Operation.
   */
  getAttributes(): TTextOperationAttributes | null;
  /**
   * Returns String representation of an Individual Text Operation
   */
  toString(): string;
  /**
   * Returns Primitive value of an Individual Text Operation
   */
  valueOf(): string | number;
}
