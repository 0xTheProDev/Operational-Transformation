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

import { PlainTextOperation } from "@otjs/plaintext";
import { Cursor } from "../src/cursor.impl";
import { OperationMetadata } from "../src/operation-metadata.impl";
import { IUndoManager } from "../src/undo-manager";
import { UndoManager } from "../src/undo-manager.impl";
import { IWrappedOperation } from "../src/wrapped-operation";
import { WrappedOperation } from "../src/wrapped-operation.impl";

describe("Undo Manager", () => {
  let undoManager: IUndoManager;
  let wrappedOperation: IWrappedOperation;

  beforeAll(() => {
    const operation = new PlainTextOperation().retain(15);
    const operationMeta = new OperationMetadata(
      new Cursor(0, 0),
      new Cursor(4, 9),
    );
    wrappedOperation = new WrappedOperation(operation, operationMeta);
  });

  beforeEach(() => {
    undoManager = new UndoManager();
  });

  afterEach(() => {
    undoManager.dispose();

    // @ts-expect-error
    undoManager = null;
  });

  describe("#dispose", () => {
    it("should cleanup Undo stack", () => {
      undoManager.add(wrappedOperation);
      undoManager.dispose();
      expect(undoManager.canUndo()).toBe(false);
    });

    it("should cleanup Redo stack", () => {
      undoManager.add(wrappedOperation);
      undoManager.dispose();
      expect(undoManager.canRedo()).toBe(false);
    });
  });

  describe("#add", () => {
    it("should add operation to Undo stack in normal state", () => {
      undoManager.add(wrappedOperation);
      expect(undoManager.canUndo()).toBe(true);
    });

    it("should add operation to Redo stack in undoing state", () => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      expect(undoManager.canRedo()).toBe(true);
    });

    it("should add operation to Undo stack in redoing state", () => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      undoManager.performRedo(() => {
        undoManager.add(wrappedOperation);
      });
      expect(undoManager.canUndo()).toBe(true);
    });

    it("should compose with last operation if exists and compose set to true", () => {
      const nextOperation = wrappedOperation.clone();
      undoManager = new UndoManager(1);
      undoManager.add(wrappedOperation);
      undoManager.add(nextOperation, true);
      undoManager.performUndo(() => {
        /** Empty Callback */
      });
      expect(undoManager.canUndo()).toBe(false);
    });

    it("should not add more operations than the limit given", () => {
      undoManager = new UndoManager(1);
      undoManager.add(wrappedOperation);
      undoManager.add(wrappedOperation.invert("Test"));
      undoManager.performUndo(() => {
        /** Empty Callback */
      });
      expect(undoManager.canUndo()).toBe(false);
    });

    it("should throw error if the limit is set to zero", () => {
      const fn = () => new UndoManager(0);
      expect(fn).toThrow();
    });
  });

  describe("#last", () => {
    it("should return last operation in Undo stack", () => {
      undoManager.add(wrappedOperation);
      expect(undoManager.last()).toEqual(wrappedOperation);
    });
  });

  describe("#transform", () => {
    it("should transform Undo/Redo stack to incoming operation", () => {
      undoManager.add(wrappedOperation);
      const operation = new PlainTextOperation()
        .retain(15, null)
        .insert("Hello", null);
      undoManager.transform(operation);
      expect(undoManager.last()).not.toEqual(wrappedOperation);
    });
  });

  describe("#isUndoing", () => {
    it("should return true if the manager is undoing an operation", (done) => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        expect(undoManager.isUndoing()).toBe(true);
        done();
      });
    });
  });

  describe("#isRedoing", () => {
    it("should return true if the manager is redoing an operation", (done) => {
      undoManager.add(wrappedOperation);
      undoManager.performUndo(() => {
        undoManager.add(wrappedOperation.invert(""));
      });
      undoManager.performRedo(() => {
        expect(undoManager.isRedoing()).toBe(true);
        done();
      });
    });
  });
});
