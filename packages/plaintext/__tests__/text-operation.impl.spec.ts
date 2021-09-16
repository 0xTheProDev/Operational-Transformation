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

import { IPlainTextOperation, TTextOperationAttributes } from "@otjs/plaintext";
import { PlainTextOperation } from "../src/text-operation.impl";

describe("Plain Text Operation", () => {
  describe("#equals", () => {
    it("should return true if two operation makes the same effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation1 = new PlainTextOperation()
        .retain(retainCount)
        .delete(deleteCount)
        .insert(insertText);
      const operation2 = new PlainTextOperation()
        .retain(retainCount)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation1.equals(operation2)).toBe(true);
    });

    it("should return false if two operation makes different effect", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation1 = new PlainTextOperation()
        .retain(retainCount)
        .delete(deleteCount)
        .insert(insertText);
      const operation2 = new PlainTextOperation()
        .retain(retainCount)
        .delete(deleteCount);

      expect(operation1.equals(operation2)).toBe(false);
    });

    it("should return false if two operation are to be applied to different document", () => {
      const retainCount = 32,
        deleteCount = 2;

      const operation1 = new PlainTextOperation()
        .retain(retainCount)
        .delete(deleteCount);
      const operation2 = new PlainTextOperation()
        .retain(retainCount + 1)
        .delete(deleteCount);

      expect(operation1.equals(operation2)).toBe(false);
    });
  });

  describe("#retain", () => {
    it("should create retain operation", () => {
      const retainCount = 32;
      const operation = new PlainTextOperation().retain(retainCount);
      expect(operation.valueOf()).toEqual([32]);
    });

    it("should add characters to last op if last op is also retain", () => {
      const retainCount = 32,
        nextRetainCount = 13;

      const operation = new PlainTextOperation()
        .retain(retainCount)
        .retain(nextRetainCount);
      expect(operation.valueOf()).toEqual([retainCount + nextRetainCount]);
    });

    it("should not create any new op if 0 characters retained", () => {
      const operation = new PlainTextOperation().retain(0);
      expect(operation.valueOf()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () => new PlainTextOperation().retain(-5);
      expect(fn).toThrow();
    });
  });

  describe("#insert", () => {
    it("should create insert operation", () => {
      const insertText = "Hello World";
      const operation = new PlainTextOperation().insert(insertText);
      expect(operation.valueOf()).toEqual([insertText]);
    });

    it("should add text to last op if last op is also insert", () => {
      const insertText = "Hello ",
        nextInsertText = "World";

      const operation = new PlainTextOperation()
        .insert(insertText)
        .insert(nextInsertText);

      expect(operation.valueOf()).toEqual([insertText + nextInsertText]);
    });

    it("should add insert op before last op if the last op is delete", () => {
      const insertText = "Hello ",
        nextInsertText = "World",
        deleteCount = 5;

      const operation = new PlainTextOperation()
        .insert(insertText)
        .delete(deleteCount)
        .insert(nextInsertText, { attr: true });

      expect(operation.valueOf()).toEqual([
        insertText,
        { attr: true },
        nextInsertText,
        -deleteCount,
      ]);
    });

    it("should add text to next to last op if the op is insert with same attributes followed by a delete op", () => {
      const insertText = "Hello ",
        nextInsertText = "World",
        deleteCount = 5;

      const operation = new PlainTextOperation()
        .insert(insertText)
        .delete(deleteCount)
        .insert(nextInsertText);

      expect(operation.valueOf()).toEqual([
        insertText + nextInsertText,
        -deleteCount,
      ]);
    });

    it("should not create any new op if empty string inserted", () => {
      const operation = new PlainTextOperation().insert("");
      expect(operation.valueOf()).toEqual([]);
    });
  });

  describe("#delete", () => {
    it("should create delete operation", () => {
      const deleteCount = 32;
      const operation = new PlainTextOperation().delete(deleteCount);
      expect(operation.valueOf()).toEqual([-deleteCount]);
    });

    it("should add characters to last op if last op is also delete", () => {
      const deleteCount = 32,
        nextDeleteCount = 13;

      const operation = new PlainTextOperation()
        .delete(deleteCount)
        .delete(nextDeleteCount);

      expect(operation.valueOf()).toEqual([-(deleteCount + nextDeleteCount)]);
    });

    it("should convert into number of character deleted if deleted text is passed as param", () => {
      const deleteText = "Hello World";
      const operation = new PlainTextOperation().delete(deleteText);
      expect(operation.valueOf()).toEqual([-deleteText.length]);
    });

    it("should not create any new op if 0 characters deleted", () => {
      const operation = new PlainTextOperation().delete(0);
      expect(operation.valueOf()).toEqual([]);
    });

    it("should throw error if non-positive number passed as param", () => {
      const fn = () => new PlainTextOperation().delete(-5);
      expect(fn).toThrow();
    });
  });

  describe("#isNoop", () => {
    it("should return true if there is no ops", () => {
      const operation = new PlainTextOperation();
      expect(operation.isNoop()).toBe(true);
    });

    it("should return true if the ops does not change document", () => {
      const operation = new PlainTextOperation().retain(5).retain(3);

      expect(operation.isNoop()).toBe(true);
    });

    it("should return false if the ops change document", () => {
      const operation = new PlainTextOperation().retain(5).delete(3);
      expect(operation.isNoop()).toBe(false);
    });
  });

  describe("#clone", () => {
    it("should deep clone ops into new text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation = new PlainTextOperation()
        .retain(retainCount)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation.clone().valueOf()).toEqual([
        retainCount,
        insertText,
        -deleteCount,
      ]);
    });
  });

  describe("#apply", () => {
    it("should apply a text operation to given text content", () => {
      const content = "Hello World";
      const operation = new PlainTextOperation()
        .retain(6)
        .insert("Me")
        .delete("World");
      expect(operation.apply(content)).toBe("Hello Me");
    });

    it("should propagate attributes on applying a text operation", () => {
      const content = "Hello World",
        attributes: TTextOperationAttributes[] = [];

      const retainCount = 6,
        retainAttrs = { what: "hello" },
        insertText = "Me",
        insertAttrs = { who: "me" };

      const operation = new PlainTextOperation()
        .retain(retainCount, retainAttrs)
        .insert(insertText, insertAttrs)
        .delete(5);

      const composedAttributes = [
        ...Array(retainCount).fill(retainAttrs),
        ...Array(insertText.length).fill(insertAttrs),
      ];

      operation.apply(content, [], attributes);
      expect(attributes).toEqual(composedAttributes);
    });

    it("should throw error if operated over content length", () => {
      const content = "Hello World";
      const operation = new PlainTextOperation().retain(12);
      const fn = () => operation.apply(content);
      expect(fn).toThrow();
    });
  });

  describe("#invert", () => {
    it("should return a text operation that undoes effect of the given one", () => {
      const content = "Hello World";

      const operation = new PlainTextOperation()
        .retain(6)
        .insert("Me")
        .delete("World");

      const invertedOperation = new PlainTextOperation()
        .retain(6)
        .insert("World")
        .delete("Me");

      expect(operation.invert(content)).toEqual(invertedOperation);
    });
  });

  describe("#isEqualBaseLength", () => {
    it("should return true if base length of the operaion is equal to given number", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      expect(operation.isEqualBaseLength(6)).toBe(true);
    });

    it("should return false if base length of the operaion is not equal to given number", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      expect(operation.isEqualBaseLength(4)).toBe(false);
    });
  });

  describe("#isEqualTargetLength", () => {
    it("should return true if target length of the operaion is equal to given number", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      expect(operation.isEqualTargetLength(8)).toBe(true);
    });

    it("should return false if target length of the operaion is not equal to given number", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      expect(operation.isEqualTargetLength(6)).toBe(false);
    });
  });

  describe("#canMergeWith", () => {
    it("should return True if two operation can be applied sequentially", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(8).insert("!");

      expect(operation.canMergeWith(otherOperation)).toEqual(true);
    });

    it("should return False if two operation can not be applied sequentially", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(6).insert("!");

      expect(operation.canMergeWith(otherOperation)).toBe(false);
    });
  });

  describe("#compose", () => {
    it("should return a text operation that produces same effect as two individual ones applied sequentially", () => {
      const content = "Hello World";

      const operation = new PlainTextOperation()
        .retain(6)
        .insert("Me")
        .delete("World");

      const otherOperation = new PlainTextOperation()
        .retain(6)
        .insert("World")
        .delete("Me");

      const composedOperation = operation.compose(
        otherOperation
      ) as IPlainTextOperation;
      expect(composedOperation.apply(content)).toBe(content);
    });
  });

  describe("#shouldBeComposedWith", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new PlainTextOperation()
        .retain(6)
        .insert("Me")
        .delete(5);

      const otherOperation = new PlainTextOperation().retain(12);
      expect(operation.shouldBeComposedWith(otherOperation)).toBe(true);
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(8).insert("!");

      expect(operation.shouldBeComposedWith(otherOperation)).toBe(true);
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new PlainTextOperation().retain(6).delete("Me");
      const otherOperation = new PlainTextOperation().retain(6).delete("!");

      expect(operation.shouldBeComposedWith(otherOperation)).toBe(true);
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(6).delete("!");

      expect(operation.shouldBeComposedWith(otherOperation)).toBe(false);
    });
  });

  describe("#shouldBeComposedWithInverted", () => {
    it("should return true if either operation has no effect", () => {
      const operation = new PlainTextOperation()
        .retain(6)
        .insert("Me")
        .delete(5);

      const otherOperation = new PlainTextOperation().retain(12);
      expect(operation.shouldBeComposedWithInverted(otherOperation)).toBe(true);
    });

    it("should return true if insert op from other operation compatible with first one", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(8).insert("!");

      expect(operation.shouldBeComposedWithInverted(otherOperation)).toBe(true);
    });

    it("should return true if retain op from other operation compatible with first one", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(6).insert("!");

      expect(operation.shouldBeComposedWithInverted(otherOperation)).toBe(true);
    });

    it("should return true if delete op from other operation compatible with first one", () => {
      const operation = new PlainTextOperation().retain(7).delete("Me");
      const otherOperation = new PlainTextOperation().retain(6).delete("!");

      expect(operation.shouldBeComposedWithInverted(otherOperation)).toBe(true);
    });

    it("should return false if two operations are incompatible of each other", () => {
      const operation = new PlainTextOperation().retain(6).insert("Me");
      const otherOperation = new PlainTextOperation().retain(6).delete("!");

      expect(operation.shouldBeComposedWithInverted(otherOperation)).toBe(
        false
      );
    });
  });

  describe("#transform", () => {
    it("should throw error if two operation came from different document", () => {
      const operation1 = new PlainTextOperation().retain(6).insert("Me");
      const operation2 = new PlainTextOperation().retain(8).insert("!");

      const fn = () => operation1.transform(operation2);
      expect(fn).toThrow();
    });

    it("should transform two operation such that they can be reversed", () => {
      const operation1 = new PlainTextOperation()
        .retain(2)
        .insert("Me")
        .delete(4)
        .retain(2);

      const operation2 = new PlainTextOperation()
        .retain(3)
        .insert("!")
        .retain(5);

      const transformedOperation = new PlainTextOperation()
        .retain(4)
        .insert("!")
        .retain(2);

      expect(operation1.transform(operation2)).toContainEqual(
        transformedOperation
      );
    });
  });

  describe("#toString", () => {
    it("should pretty print a text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation = new PlainTextOperation()
        .retain(retainCount)
        .insert(insertText)
        .delete(deleteCount);

      const opString = `RETAIN ${retainCount}, INSERT "${insertText}", DELETE ${deleteCount}`;
      expect(operation.toString()).toBe(opString);
    });
  });

  describe("#valueOf", () => {
    it("should convert text operation into JSON representation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation = new PlainTextOperation()
        .retain(retainCount)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation.valueOf()).toEqual([
        retainCount,
        insertText,
        -deleteCount,
      ]);
    });

    it("should persist attributes of ops", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello",
        attrs = { attr: true };

      const operation = new PlainTextOperation()
        .retain(retainCount, attrs)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation.valueOf()).toEqual([
        attrs,
        retainCount,
        insertText,
        -deleteCount,
      ]);
    });

    it("should empty set if no ops", () => {
      const operation = new PlainTextOperation();
      expect(operation.valueOf()).toEqual([]);
    });
  });

  describe("#toJSON", () => {
    it("should convert text operation into JSON representation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello";

      const operation = new PlainTextOperation()
        .retain(retainCount)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation.toJSON()).toEqual([
        retainCount,
        insertText,
        -deleteCount,
      ]);
    });

    it("should persist attributes of ops", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello",
        attrs = { attr: true };

      const operation = new PlainTextOperation()
        .retain(retainCount, attrs)
        .insert(insertText)
        .delete(deleteCount);

      expect(operation.toJSON()).toEqual([
        attrs,
        retainCount,
        insertText,
        -deleteCount,
      ]);
    });

    it("should return 0 character retained if no ops", () => {
      const operation = new PlainTextOperation();
      expect(operation.toJSON()).toEqual([0]);
    });
  });

  describe(".fromJSON", () => {
    it("should convert JSON representation into text operation", () => {
      const retainCount = 32,
        deleteCount = 2,
        insertText = "Hello",
        attrs = { attr: true };

      const operation = new PlainTextOperation()
        .retain(retainCount, attrs)
        .insert(insertText)
        .delete(deleteCount);

      const ops = [attrs, retainCount, insertText, -deleteCount];
      expect(PlainTextOperation.fromJSON(ops)).toEqual(operation);
    });
  });
});
