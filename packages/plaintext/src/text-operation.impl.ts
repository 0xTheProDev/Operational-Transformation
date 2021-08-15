import { assert } from "@ot/utils";
import { DeleteOperation } from "./delete-operation";
import { InsertOperation } from "./insert-operation";
import { ITextOperation, ITextOperationAttributes } from "./operation";
import { RetainOperation } from "./retain-operation";
import { IPlainTextOperation, TPlainTextOperation } from "./text-operation";

/**
 * @public
 * Implementation Class of Operational Transformation of Plain Text
 */
export class PlainTextOperation implements IPlainTextOperation {
  protected readonly _ops: ITextOperation[];

  protected _baseLength: number;
  protected _targetLength: number;

  constructor() {
    // When an operation is applied to an input string, you can think of this as
    // if an imaginary cursor runs over the entire string and skips over some
    // parts, deletes some parts and inserts characters at some positions. These
    // actions (skip/delete/insert) are stored as an array in the "ops" property.
    this._ops = [];
    // An operation's baseLength is the length of every string the operation
    // can be applied to.
    this._baseLength = 0;
    // The targetLength is the length of every string that results from applying
    // the operation on a valid input string.
    this._targetLength = 0;
  }

  equals(other: PlainTextOperation): boolean {
    if (this._baseLength !== other._baseLength) {
      return false;
    }

    if (this._targetLength !== other._targetLength) {
      return false;
    }

    if (this._ops.length !== other._ops.length) {
      return false;
    }

    return this._ops.every((op, index) => op.equals(other._ops[index]));
  }

  /**
   * Returns nth last op from the ops array.
   * @param n - Reverse Index of the item.
   */
  protected _last(n: number = 0): ITextOperation | null {
    return this._ops.length > n ? this._ops[this._ops.length - n - 1] : null;
  }

  retain(
    n: number,
    attributes: ITextOperationAttributes | null = null
  ): IPlainTextOperation {
    assert(n >= 0, "Retain expects a positive integer.");

    if (n === 0) {
      return this;
    }

    this._baseLength += n;
    this._targetLength += n;

    attributes ||= {};
    const prevOp = this._last();

    if (prevOp && prevOp.isRetain() && prevOp.attributesEqual(attributes)) {
      // The last op is a retain op with the same attributes => we can merge them into one op.
      prevOp.addCharacterCount(n);
    } else {
      // Create a new op.
      this._ops.push(new RetainOperation(n, attributes));
    }

    return this;
  }

  insert(
    str: string,
    attributes: ITextOperationAttributes | null = null
  ): IPlainTextOperation {
    assert(typeof str === "string", "Insert expects a string.");

    if (str === "") {
      return this;
    }

    this._targetLength += str.length;

    attributes ||= {};
    const prevOp = this._last();
    const prevPrevOp = this._last(1);

    if (prevOp && prevOp.isInsert() && prevOp.attributesEqual(attributes)) {
      // Merge insert op.
      prevOp.addTextContent(str);
    } else if (prevOp && prevOp.isDelete()) {
      // It doesn't matter when an operation is applied whether the operation
      // is delete(3), insert("something") or insert("something"), delete(3).
      // Here we enforce that in this case, the insert op always comes first.
      // This makes all operations that have the same effect when applied to
      // a document of the right length equal in respect to the `equals` method.
      if (
        prevPrevOp &&
        prevPrevOp.isInsert() &&
        prevPrevOp.attributesEqual(attributes)
      ) {
        prevPrevOp.addTextContent(str);
      } else {
        this._ops[this._ops.length - 1] = new InsertOperation(str, attributes);
        this._ops.push(prevOp);
      }
    } else {
      this._ops.push(new InsertOperation(str, attributes));
    }

    return this;
  }

  delete(n: string | number): IPlainTextOperation {
    let num: number;

    if (typeof n === "string") {
      num = n.length;
    } else {
      num = n;
    }

    assert(num >= 0, "Delete expects a positive integer or string.");

    if (num === 0) {
      return this;
    }

    this._baseLength += num;

    const prevOp = this._last();

    if (prevOp && prevOp.isDelete()) {
      prevOp.addCharacterCount(num);
    } else {
      this._ops.push(new DeleteOperation(num));
    }

    return this;
  }

  isNoop(): boolean {
    if (this._ops.length === 0) {
      return true;
    }

    return this._ops.every((op) => op.isRetain() && op.hasEmptyAttributes());
  }

  clone(): IPlainTextOperation {
    const ops = this._ops;
    const clone = new PlainTextOperation();

    for (const op of ops) {
      if (op.isRetain()) {
        clone.retain(op.characterCount(), op.getAttributes());
      } else if (op.isInsert()) {
        clone.insert(op.textContent(), op.getAttributes());
      } else {
        clone.delete(op.characterCount());
      }
    }

    return clone;
  }

  entries(): IterableIterator<[number, ITextOperation]> {
    return this._ops.entries();
  }

  apply(
    prevContent: string,
    prevAttributes: ITextOperationAttributes[] = [],
    attributes: ITextOperationAttributes[] = []
  ): string {
    assert(
      prevContent.length === this._baseLength,
      "The operation's base length must be equal to the string's length."
    );

    const contentSlices: string[] = [];
    let cursorPosition: number = 0;

    for (const op of this._ops) {
      if (op.isRetain()) {
        const retainCount = op.characterCount();
        const nextCursorPosition = cursorPosition + retainCount;

        assert(
          nextCursorPosition <= prevContent.length,
          "Operation can't retain more characters than are left in the string."
        );

        // Copy skipped part of the retained string
        contentSlices.push(
          prevContent.slice(cursorPosition, nextCursorPosition)
        );

        // Copy (and potentially update) attributes for each char in retained string
        for (let k = 0; k < retainCount; k++) {
          const currAttributes: ITextOperationAttributes =
            prevAttributes[cursorPosition + k] || {};
          const updatedAttributes: ITextOperationAttributes = {};

          for (const attr in currAttributes) {
            updatedAttributes[attr] = currAttributes[attr];

            assert(
              updatedAttributes[attr] != false,
              "Expected attribute value to be true"
            );
          }

          const opAttributes = op.getAttributes();

          for (const attr in opAttributes) {
            if (opAttributes[attr] === false) {
              delete updatedAttributes[attr];
            } else {
              updatedAttributes[attr] = opAttributes[attr];
            }

            assert(
              updatedAttributes[attr] != false,
              "Expected attribute value to be true"
            );
          }

          attributes.push(updatedAttributes);
        }

        cursorPosition = nextCursorPosition;
      } else if (op.isInsert()) {
        // Insert string.
        const textContent = op.textContent();
        contentSlices.push(textContent);

        // Insert attributes for each char
        for (let k = 0; k < textContent.length; k++) {
          const opAttributes = op.getAttributes();
          const insertAttributes: ITextOperationAttributes = {};

          for (const attr in opAttributes) {
            insertAttributes[attr] = opAttributes[attr];
            assert(
              insertAttributes[attr] != false,
              "Expected attribute value to be true"
            );
          }

          attributes.push(insertAttributes);
        }
      } else {
        // Skip cursor position on delete
        cursorPosition += op.characterCount();
      }
    }

    assert(
      cursorPosition === prevContent.length,
      "The operation didn't operate on the whole string."
    );

    const content = contentSlices.join("");

    assert(
      content.length === attributes.length,
      "Attributes length did not match content length."
    );

    return content;
  }

  invert(content: string): IPlainTextOperation {
    const ops = this._ops;
    const inverse = new PlainTextOperation();
    let cursorPosition = 0;

    for (const op of ops) {
      if (op.isRetain()) {
        const retainCount = op.characterCount();
        inverse.retain(retainCount, op.getAttributes());
        cursorPosition += retainCount;
      } else if (op.isInsert()) {
        const textContent = op.textContent();
        inverse.delete(textContent.length);
      } else {
        const deleteCount = op.characterCount();
        inverse.insert(
          content.slice(cursorPosition, cursorPosition + deleteCount),
          op.getAttributes()
        );
        cursorPosition += deleteCount;
      }
    }

    return inverse;
  }

  protected _getSimpleOp(operation: PlainTextOperation): ITextOperation | null {
    const ops = operation._ops;

    switch (ops.length) {
      case 1: {
        return ops[0];
      }
      case 2: {
        if (ops[0].isRetain()) {
          return ops[1];
        }

        if (ops[1].isRetain()) {
          return ops[0];
        }

        break;
      }
      case 3: {
        if (ops[0].isRetain() && ops[2].isRetain()) {
          return ops[1];
        }

        break;
      }
      default: {
        break;
      }
    }
    return null;
  }

  protected _getStartIndex(operation: PlainTextOperation): number {
    const ops = operation._ops;

    if (!ops) {
      return 0;
    }

    const firstOp = ops[0];

    if (firstOp && firstOp.isRetain()) {
      return firstOp.characterCount();
    }

    return 0;
  }

  shouldBeComposedWith(other: PlainTextOperation): boolean {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = this._getStartIndex(this);
    const startB = this._getStartIndex(other);

    const simpleA = this._getSimpleOp(this);
    const simpleB = this._getSimpleOp(other);

    if (simpleA == null || simpleB == null) {
      return false;
    }

    if (simpleA.isInsert() && simpleB.isInsert()) {
      return startA + simpleA.textContent().length === startB;
    }

    if (simpleA.isDelete() && simpleB.isDelete()) {
      // there are two possibilities to delete: with backspace and with the
      // delete key.
      return startB + simpleB.characterCount() === startA || startA === startB;
    }

    return false;
  }

  shouldBeComposedWithInverted(other: PlainTextOperation): boolean {
    if (this.isNoop() || other.isNoop()) {
      return true;
    }

    const startA = this._getStartIndex(this);
    const startB = this._getStartIndex(other);

    const simpleA = this._getSimpleOp(this);
    const simpleB = this._getSimpleOp(other);

    if (simpleA == null || simpleB == null) {
      return false;
    }

    if (simpleA.isInsert() && simpleB.isInsert()) {
      return (
        startA + simpleA.textContent().length === startB || startA === startB
      );
    }

    if (simpleA.isDelete() && simpleB.isDelete()) {
      return startB + simpleB.characterCount() === startA;
    }

    return false;
  }

  /**
   * Returns next Text Operation from Iterator
   * @param opIterator - Iterator Protocol Object containing Text Operation
   */
  protected _nextTextOp(
    opIterator: IterableIterator<[number, ITextOperation]>
  ): ITextOperation | null {
    const opIteratorResult: [number, ITextOperation] | void =
      opIterator.next().value;

    return opIteratorResult ? opIteratorResult[1] : null;
  }

  protected _composeAttributes(
    first: ITextOperationAttributes | null,
    second: ITextOperationAttributes | null,
    firstOpIsInsert: boolean
  ): ITextOperationAttributes {
    const merged: ITextOperationAttributes = {};

    for (const attr in first) {
      merged[attr] = first[attr];
    }

    for (const attr in second) {
      if (firstOpIsInsert && second[attr] === false) {
        delete merged[attr];
      } else {
        merged[attr] = second[attr];
      }
    }

    return merged;
  }

  compose(otherOperation: IPlainTextOperation): IPlainTextOperation {
    assert(
      this.canMergeWith(otherOperation),
      "The base length of the second operation has to be the target length of the first operation"
    );

    const operation = new PlainTextOperation();

    const opIterator1 = this.entries();
    const opIterator2 = otherOperation.entries();

    let op1: ITextOperation | null = this._nextTextOp(opIterator1);
    let op2: ITextOperation | null = this._nextTextOp(opIterator2);

    while (true) {
      // Dispatch on the type of op1 and op2
      if (op1 == null && op2 == null) {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      if (op1 && op1.isDelete()) {
        operation.delete(op1.characterCount());
        op1 = this._nextTextOp(opIterator1);
        continue;
      }

      if (op2 && op2.isInsert()) {
        operation.insert(op2.textContent(), op2.getAttributes());
        op2 = this._nextTextOp(opIterator2);
        continue;
      }

      assert(
        op1 != null,
        "Cannot compose operations: first operation is too short."
      );
      assert(
        op2 != null,
        "Cannot compose operations: first operation is too long."
      );

      if (op1 == null || op2 == null) {
        /** Above guard rules will throw error anyway, this unreachable code is to provide type support of subequent operations. */
        break;
      }

      if (op1.isRetain() && op2.isRetain()) {
        const attributes = this._composeAttributes(
          op1.getAttributes(),
          op2.getAttributes(),
          false
        );

        if (op1.characterCount() > op2.characterCount()) {
          operation.retain(op2.characterCount(), attributes);
          op1.addCharacterCount(-op2.characterCount());

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          operation.retain(op1.characterCount(), attributes);

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          operation.retain(op1.characterCount(), attributes);
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isInsert() && op2.isDelete()) {
        if (op1.textContent().length > op2.characterCount()) {
          op1.setTextContent(op1.textContent().slice(op2.characterCount()));

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.textContent().length === op2.characterCount()) {
          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          op2.addCharacterCount(-op1.textContent().length);

          op1 = this._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isInsert() && op2.isRetain()) {
        const attributes = this._composeAttributes(
          op1.getAttributes(),
          op2.getAttributes(),
          true
        );

        if (op1.textContent().length > op2.characterCount()) {
          operation.insert(
            op1.textContent().slice(0, op2.characterCount()),
            attributes
          );
          op1.setTextContent(op1.textContent().slice(op2.characterCount()));

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.textContent().length === op2.characterCount()) {
          operation.insert(op1.textContent(), attributes);

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          operation.insert(op1.textContent(), attributes);
          op2.addCharacterCount(-op1.textContent().length);

          op1 = this._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isRetain() && op2.isDelete()) {
        if (op1.characterCount() > op2.characterCount()) {
          operation.delete(op2.characterCount());
          op1.addCharacterCount(-op2.characterCount());

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          operation.delete(op2.characterCount());

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          operation.delete(op1.characterCount());
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }
        continue;
      }

      assert(false, `This should not happen:\nop1: ${op1}\nop2: ${op2}`);
    }

    return operation;
  }

  protected _transformAttributes(
    attributes1: ITextOperationAttributes | null,
    attributes2: ITextOperationAttributes | null
  ): [ITextOperationAttributes, ITextOperationAttributes] {
    const attributes1prime: ITextOperationAttributes = {};
    const attributes2prime: ITextOperationAttributes = {};

    const allAttrs: ITextOperationAttributes = {};

    for (const attr in attributes1) {
      allAttrs[attr] = true;
    }

    for (const attr in attributes2) {
      allAttrs[attr] = true;
    }

    for (const attr in allAttrs) {
      const attr1 = attributes1![attr];
      const attr2 = attributes2![attr];

      assert(attr1 != null || attr2 != null, "Failed to transform attributes");

      if (attr1 == null) {
        // Only modified by attributes2; keep it.
        attributes2prime[attr] = attr2;
      } else if (attr2 == null) {
        // only modified by attributes1; keep it
        attributes1prime[attr] = attr1;
      } else if (attr1 === attr2) {
        // Both set it to the same value.  Nothing to do.
      } else {
        // attr1 and attr2 are different. Prefer attr1.
        attributes1prime[attr] = attr1;
      }
    }

    return [attributes1prime, attributes2prime];
  }

  transform(
    operation: IPlainTextOperation
  ): [IPlainTextOperation, IPlainTextOperation] {
    assert(
      operation.isEqualBaseLength(this._baseLength),
      "Both operations have to have the same base length"
    );

    const operation1prime = new PlainTextOperation();
    const operation2prime = new PlainTextOperation();

    const opIterator1 = this.entries();
    const opIterator2 = operation.entries();

    let op1: ITextOperation | null = this._nextTextOp(opIterator1);
    let op2: ITextOperation | null = this._nextTextOp(opIterator2);

    while (true) {
      // At every iteration of the loop, the imaginary cursor that both
      // operation1 and operation2 have that operates on the input string must
      // have the same position in the input string.
      if (op1 == null && op2 == null) {
        // end condition: both ops1 and ops2 have been processed
        break;
      }

      // next two cases: one or both ops are insert ops
      // => insert the string in the corresponding prime operation, skip it in
      // the other one. If both op1 and op2 are insert ops, prefer op1.
      if (op1 && op1.isInsert()) {
        operation1prime.insert(op1.textContent(), op1.getAttributes());
        operation2prime.retain(op1.textContent().length, op1.getAttributes());
        op1 = this._nextTextOp(opIterator1);
        continue;
      }

      if (op2 && op2.isInsert()) {
        operation1prime.retain(op2.textContent().length, op2.getAttributes());
        operation2prime.insert(op2.textContent(), op2.getAttributes());
        op2 = this._nextTextOp(opIterator2);
        continue;
      }

      assert(
        op1 != null,
        "Cannot transform operations: first operation is too short."
      );
      assert(
        op2 != null,
        "Cannot transform operations: first operation is too long."
      );

      if (op1 == null || op2 == null) {
        /** Above guard rules will throw error anyway, this unreachable code is to provide type support of subequent operations. */
        break;
      }

      if (op1.isRetain() && op2.isRetain()) {
        // Simple case: retain/retain
        let cursorPosition: number = 0;
        const attributesPrime = this._transformAttributes(
          op1.getAttributes(),
          op2.getAttributes()
        );

        if (op1.characterCount() > op2.characterCount()) {
          cursorPosition = op2.characterCount();
          op1.addCharacterCount(-op2.characterCount())!;

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          cursorPosition = op2.characterCount();

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.characterCount();
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }

        operation1prime.retain(cursorPosition, attributesPrime[0]);
        operation2prime.retain(cursorPosition, attributesPrime[1]);
        continue;
      }

      if (op1.isDelete() && op2.isDelete()) {
        // Both operations delete the same string at the same position. We don't
        // need to produce any operations, we just skip over the delete ops and
        // handle the case that one operation deletes more than the other.
        if (op1.characterCount() > op2.characterCount()) {
          op1.addCharacterCount(-op2.characterCount());

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }
        continue;
      }

      if (op1.isDelete() && op2.isRetain()) {
        let cursorPosition: number = 0;

        if (op1.characterCount() > op2.characterCount()) {
          cursorPosition = op2.characterCount()!;
          op1.addCharacterCount(-op2.characterCount());

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          cursorPosition = op2.characterCount();

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.characterCount();
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }

        operation1prime.delete(cursorPosition);
        continue;
      }

      if (op1.isRetain() && op2.isDelete()) {
        let cursorPosition: number = 0;

        if (op1.characterCount() > op2.characterCount()) {
          cursorPosition = op2.characterCount();
          op1.addCharacterCount(-op2.characterCount());

          op2 = this._nextTextOp(opIterator2);
        } else if (op1.characterCount() === op2.characterCount()) {
          cursorPosition = op1.characterCount();

          op1 = this._nextTextOp(opIterator1);
          op2 = this._nextTextOp(opIterator2);
        } else {
          cursorPosition = op1.characterCount();
          op2.addCharacterCount(-op1.characterCount());

          op1 = this._nextTextOp(opIterator1);
        }

        operation2prime.delete(cursorPosition);
        continue;
      }

      assert(
        false,
        `The two operations aren't compatible:\nop1: ${op1}\nop2: ${op2}`
      );
    }

    return [operation1prime, operation2prime];
  }

  isEqualBaseLength(length: number): boolean {
    return this._baseLength === length;
  }

  isEqualTargetLength(length: number): boolean {
    return this._targetLength === length;
  }

  canMergeWith(other: IPlainTextOperation): boolean {
    return other.isEqualBaseLength(this._targetLength);
  }

  toString(): string {
    return this._ops.map((op) => op.toString()).join(", ");
  }

  valueOf(): TPlainTextOperation {
    const ops = this._ops;
    const opValues: TPlainTextOperation = [];

    for (const op of ops) {
      if (!op.hasEmptyAttributes()) {
        opValues.push(op.getAttributes()!);
      }

      opValues.push(op.valueOf());
    }

    return opValues;
  }

  toJSON(): TPlainTextOperation {
    const opValues = this.valueOf();

    // Handle the scenario where empty array is treated as null or undefined.
    if (opValues.length === 0) {
      opValues.push(0);
    }

    return opValues;
  }

  /**
   * Converts JSON representation of TextOperation into TextOperation object.
   */
  static fromJSON(ops: TPlainTextOperation): PlainTextOperation {
    const operation = new PlainTextOperation();
    let attributes: ITextOperationAttributes = {};

    for (const op of ops) {
      if (typeof op === "object") {
        attributes = op;
        continue;
      }

      if (typeof op === "string") {
        operation.insert(op, attributes);
        attributes = {};
        continue;
      }

      assert(
        Number.isInteger(op),
        "invalid number found, can not assign to retain or delete operation."
      );

      if (op < 0) {
        operation.delete(-op);
        attributes = {};
        continue;
      }

      operation.retain(op, attributes);
      attributes = {};
    }

    return operation;
  }
}
