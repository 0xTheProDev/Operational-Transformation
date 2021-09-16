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

import {
  IPlainTextOperation,
  TTextOperationAttributes,
  ITextOperation,
  TPlainTextOperation,
} from "@otjs/plaintext";
import { ICursor } from "./cursor";
import { IOperationMetadata } from "./operation-metadata";
import { IWrappedOperation } from "./wrapped-operation";

/**
 * @internal
 * Encapsulates a Plain Text operation with additional metadata (e.g., cursor)
 * @param operation - Plain Text Operation.
 * @param metadata - Additional Metadata.
 */
export class WrappedOperation implements IWrappedOperation {
  protected readonly _metadata: IOperationMetadata | null;
  protected readonly _operation: IPlainTextOperation;

  constructor(
    operation: IPlainTextOperation,
    metadata: IOperationMetadata | null = null
  ) {
    this._metadata = metadata;
    this._operation = operation;
  }

  get cursor(): ICursor | null {
    if (!this._metadata) {
      return null;
    }

    return this._metadata.getCursor();
  }

  get metadata(): IOperationMetadata | null {
    if (!this._metadata) {
      return null;
    }

    return this._metadata.clone();
  }

  get operation(): IPlainTextOperation {
    return this._operation.clone();
  }

  equals(other: IPlainTextOperation | IWrappedOperation): boolean {
    return other.equals(this._operation);
  }

  retain(
    n: number,
    attributes?: TTextOperationAttributes | null
  ): IWrappedOperation {
    this._operation.retain(n, attributes);
    return this;
  }

  insert(
    str: string,
    attributes?: TTextOperationAttributes | null
  ): IWrappedOperation {
    this._operation.insert(str, attributes);
    return this;
  }

  delete(n: string | number): IWrappedOperation {
    this._operation.delete(n);
    return this;
  }

  isNoop(): boolean {
    return this._operation.isNoop();
  }

  clone(): IWrappedOperation {
    return new WrappedOperation(
      this._operation.clone(),
      this._metadata?.clone()
    );
  }

  /* istanbul ignore next */
  entries(): IterableIterator<[number, ITextOperation]> {
    return this._operation.entries();
  }

  apply(
    prevContent: string,
    prevAttributes?: TTextOperationAttributes[],
    attributes?: TTextOperationAttributes[]
  ): string {
    return this._operation.apply(prevContent, prevAttributes, attributes);
  }

  invert(content: string): IWrappedOperation {
    return new WrappedOperation(
      this._operation.invert(content),
      this._metadata?.invert()
    );
  }

  /**
   * Returns Plain Text Operation given either a Plain Text Operation or Wrapped Operation.
   * @param operation - Another Operation
   */
  protected _getPlainTextOperation(
    operation: IPlainTextOperation | IWrappedOperation
  ): IPlainTextOperation {
    return (operation as IWrappedOperation).operation ?? operation;
  }

  /**
   * Returns Operation Metadata given either a Plain Text Operation or Wrapped Operation.
   * @param operation - Another Operation
   */
  protected _getOperationMetadata(
    operation: IPlainTextOperation | IWrappedOperation
  ): IOperationMetadata | null {
    return (operation as IWrappedOperation).metadata;
  }

  shouldBeComposedWith(
    other: IPlainTextOperation | IWrappedOperation
  ): boolean {
    const operation = this._getPlainTextOperation(other);
    return this._operation.shouldBeComposedWith(operation);
  }

  shouldBeComposedWithInverted(
    other: IPlainTextOperation | IWrappedOperation
  ): boolean {
    const operation = this._getPlainTextOperation(other);
    return this._operation.shouldBeComposedWithInverted(operation);
  }

  /**
   * Composes Metadata of current Wrapped Operation with incoming Metadata.
   * @param otherMetadata - Metadata instance to composed with.
   */
  protected _composeMetadata(
    otherMetadata: IOperationMetadata | null
  ): IOperationMetadata | null {
    if (!this._metadata) {
      return otherMetadata;
    }

    if (!otherMetadata) {
      return this._metadata;
    }

    return this._metadata.compose(otherMetadata);
  }

  compose(other: IPlainTextOperation | IWrappedOperation): IWrappedOperation {
    const otherMetadata = this._getOperationMetadata(other);
    const composedMetadata = this._composeMetadata(otherMetadata);

    const operation = this._getPlainTextOperation(other);
    return new WrappedOperation(
      this._operation.compose(operation),
      composedMetadata
    );
  }

  transform(
    other: IPlainTextOperation | IWrappedOperation
  ): [IWrappedOperation, IWrappedOperation] {
    const operation = this._getPlainTextOperation(other);
    const [pair0, pair1] = this._operation.transform(operation);

    const wrappedPair0 = new WrappedOperation(
      pair0,
      this._metadata?.transform(operation)
    );

    const metadata = this._getOperationMetadata(other);
    const wrappedPair1 = new WrappedOperation(
      pair1,
      metadata?.transform(this._operation)
    );

    return [wrappedPair0, wrappedPair1];
  }

  canMergeWith(other: IPlainTextOperation | IWrappedOperation): boolean {
    const operation = this._getPlainTextOperation(other);
    return this._operation.canMergeWith(operation);
  }

  isEqualBaseLength(length: number): boolean {
    return this._operation.isEqualBaseLength(length);
  }

  isEqualTargetLength(length: number): boolean {
    return this._operation.isEqualTargetLength(length);
  }

  toString(): string {
    return this._operation.toString();
  }

  toJSON(): TPlainTextOperation {
    return this._operation.toJSON();
  }

  valueOf(): TPlainTextOperation {
    return this._operation.valueOf();
  }
}
