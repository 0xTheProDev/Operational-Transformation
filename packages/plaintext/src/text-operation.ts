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

import { ITextOperation, TTextOperationAttributes } from "./operation";

/**
 * @public
 * Value Representation of Text Operation
 */
export type TPlainTextOperationValue =
  | string
  | number
  | TTextOperationAttributes;

/**
 * @public
 * JSON Representation of a Text Operation
 */
export type TPlainTextOperation = TPlainTextOperationValue[];

/**
 * @public
 * Interface for Operational Transformation on Plain Text
 */
export interface IPlainTextOperation {
  /**
   * Checks if two Text Operations are equivalent and equal.
   * @param other - Another Text Operation instance.
   */
  equals(other: IPlainTextOperation): boolean;
  /**
   * Skip over a given number of characters.
   * @param n - Number of Characters to Skip.
   * @param attributes - Additional Attributes for Retain.
   */
  retain(
    n: number,
    attributes?: TTextOperationAttributes | null
  ): IPlainTextOperation;
  /**
   * Insert a string at the current position.
   * @param str - String to be Inserted.
   * @param attributes - Additional Attributes for Insert.
   */
  insert(
    str: string,
    attributes?: TTextOperationAttributes | null
  ): IPlainTextOperation;
  /**
   * Delete a string at the current position.
   * @param n - Number of Characters or String to be Deleted.
   */
  delete(n: number | string): IPlainTextOperation;
  /**
   * Tests whether this operation has no effect.
   */
  isNoop(): boolean;
  /**
   * Returns Shallow copy of current operation.
   */
  clone(): IPlainTextOperation;
  /**
   * Returns an Iterator with values from Individual Operation set.
   */
  entries(): IterableIterator<[index: number, operation: ITextOperation]>;
  /**
   * Apply an operation to a string, returning a new string. Throws an error if
   * there's a mismatch between the input string and the operation.
   * @param prevContent - Text Content of Editor before applying the operation
   * @param prevAttributes - Text Operation attributes before applying
   * @param attributes - Text Operation attributes after applying (propagated)
   */
  apply(
    prevContent: string,
    prevAttributes?: TTextOperationAttributes[],
    attributes?: TTextOperationAttributes[]
  ): string;
  /**
   * Computes the inverse of an operation. The inverse of an operation is the
   * operation that reverts the effects of the operation, e.g. when you have an
   * operation 'insert("hello "); skip(6);' then the inverse is 'delete("hello ");
   * skip(6);'. The inverse should be used for implementing undo.
   * @param content - Text Content of Editor before applying the operation
   */
  invert(content: string): IPlainTextOperation;
  /**
   * When you use ctrl-z to undo your latest changes, you expect the program not
   * to undo every single keystroke but to undo your last sentence you wrote at
   * a stretch or the deletion you did by holding the backspace key down. This
   * This can be implemented by composing operations on the undo stack. This
   * method can help decide whether two operations should be composed. It
   * returns true if the operations are consecutive insert operations or both
   * operations delete text at the same position. You may want to include other
   * factors like the time since the last change in your decision.
   * @param other - Other Operation.
   */
  shouldBeComposedWith(other: IPlainTextOperation): boolean;
  /**
   * Decides whether two operations should be composed with each other
   * if they were inverted, that is
   * `shouldBeComposedWith(A, B) = shouldBeComposedWithInverted(B', A')`.
   * @param other - Other Operation
   */
  shouldBeComposedWithInverted(other: IPlainTextOperation): boolean;
  /**
   * Compose merges two consecutive operations into one operation, that
   * preserves the changes of both. Or, in other words, for each input string S
   * and a pair of consecutive operations A and B,
   * apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
   * @param operation - Consecutive Operation to be composed with.
   */
  compose(operation: IPlainTextOperation): IPlainTextOperation;
  /**
   * Transform of `A` takes another concurrent operation `B` and
   * produces two operations `A'` and `B'` (in an array) such that
   * `apply(apply(S, A), B') = apply(apply(S, B), A')`.
   * @param operation - Concurrent Operation to be composed with.
   */
  transform(
    operation: IPlainTextOperation
  ): [IPlainTextOperation, IPlainTextOperation];
  /**
   * Tests whether next operation can be chained with current one, i.e.,
   * checks if the `targetLength` of current operation is equal with the `baseLength`
   * of next operation.
   * @param other - Subsequent Operation
   */
  canMergeWith(other: IPlainTextOperation): boolean;
  /**
   * Checks if the `baseLength` of current operation is equal with the given parameter.
   * @param length - Length to compare with.
   */
  isEqualBaseLength(length: number): boolean;
  /**
   * Checks if the `targetLength` of current operation is equal with the given parameter.
   * @param length - Length to compare with.
   */
  isEqualTargetLength(length: number): boolean;
  /**
   * Returns String representation of a Text Operation
   */
  toString(): string;
  /**
   * Returns JSON representation of a Text Operation
   */
  toJSON(): TPlainTextOperation;
  /**
   * Returns Serializable set of Primitive value of a Text Operation
   */
  valueOf(): TPlainTextOperation;
}
