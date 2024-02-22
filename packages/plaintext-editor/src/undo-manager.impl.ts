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

import { IPlainTextOperation } from "@otjs/plaintext";
import { IEventHandler } from "@otjs/types";
import { assert } from "@otjs/utils";
import { IUndoManager } from "./undo-manager";
import { IWrappedOperation } from "./wrapped-operation";

/**
 * @internal
 * Internal States of Undo Redo Stack Manager.
 */
export enum UndoManagerState {
  Normal = "normal",
  Undoing = "undoing",
  Redoing = "redoing",
}

/**
 * @internal
 * Undo Redo Stack Manager to handle Undo and Redo events in Plain Text Editor.
 * @param maxItems - Maximum number of operation to hold in Undo/Redo stack (optional, defaults to `50`)
 */
export class UndoManager implements IUndoManager {
  protected readonly _maxItems: number;

  protected _compose: boolean = true;
  protected _undoStack: IWrappedOperation[] = [];
  protected _redoStack: IWrappedOperation[] = [];
  protected _state: UndoManagerState = UndoManagerState.Normal;

  /**
   * Default value `(50)` for maximum number of operation to hold in Undo/Redo stack
   */
  protected static readonly MAX_ITEM_IN_STACK: number = 50;

  constructor(maxItems: number = UndoManager.MAX_ITEM_IN_STACK) {
    assert(
      maxItems > 0,
      "Maximum size of Undo/Redo stack should at least be greater than 0",
    );
    this._maxItems = maxItems;
  }

  dispose(): void {
    assert(
      this._state === UndoManagerState.Normal,
      "Cannot dispose UndoManager while an undo/redo is in-progress",
    );

    this._undoStack = [];
    this._redoStack = [];
  }

  /** Add an operation to stack while no undo/redo is in-progress */
  protected _addOnNormalState(
    operation: IWrappedOperation,
    compose: boolean,
  ): void {
    let toPushOperation: IWrappedOperation = operation;

    if (this._compose && compose && this._undoStack.length > 0) {
      toPushOperation = operation.compose(
        this._undoStack.pop()!,
      ) as IWrappedOperation;
    }

    this._undoStack.push(toPushOperation);

    if (this._undoStack.length > this._maxItems) {
      this._undoStack.shift();
    }

    this._compose = true;
    this._redoStack = [];
  }

  /** Add an operation to stack while an undo is in-progress */
  protected _addOnUndoingState(operation: IWrappedOperation): void {
    this._redoStack.push(operation);
    this._compose = false;
  }

  /** Add an operation to stack while a redo is in-progress */
  protected _addOnRedoingState(operation: IWrappedOperation): void {
    this._undoStack.push(operation);
    this._compose = true;
  }

  add(operation: IWrappedOperation, compose: boolean = false): void {
    switch (this._state) {
      case UndoManagerState.Undoing: {
        return this._addOnUndoingState(operation);
      }
      case UndoManagerState.Redoing: {
        return this._addOnRedoingState(operation);
      }
      case UndoManagerState.Normal: {
        return this._addOnNormalState(operation, compose);
      }
    }
  }

  last(): IWrappedOperation | null {
    if (this._undoStack.length === 0) {
      return null;
    }

    return this._undoStack[this._undoStack.length - 1];
  }

  /** Update Undo/Redo stack on incoming operation during Undo/Redo event */
  protected _transformStack(
    stack: IPlainTextOperation[],
    operation: IPlainTextOperation,
  ): IWrappedOperation[] {
    const newStack: IPlainTextOperation[] = [];
    const reverseStack: IPlainTextOperation[] = [
      ...stack,
    ].reverse() as IPlainTextOperation[];

    for (const stackOp of reverseStack) {
      const pair = stackOp.transform(operation);

      /* istanbul ignore if */
      if (!pair[0].isNoop()) {
        newStack.push(pair[0]);
      }

      operation = pair[1] as IPlainTextOperation;
    }

    return newStack.reverse() as IWrappedOperation[];
  }

  transform(operation: IPlainTextOperation): void {
    this._undoStack = this._transformStack(this._undoStack, operation);
    this._redoStack = this._transformStack(this._redoStack, operation);
  }

  performUndo(callback: IEventHandler<IWrappedOperation>): void {
    assert(this._undoStack.length > 0, "Undo not possible");

    this._state = UndoManagerState.Undoing;
    callback(this._undoStack.pop()!);
    this._state = UndoManagerState.Normal;
  }

  performRedo(callback: IEventHandler<IWrappedOperation>): void {
    assert(this._redoStack.length > 0, "Redo not possible");

    this._state = UndoManagerState.Redoing;
    callback(this._redoStack.pop()!);
    this._state = UndoManagerState.Normal;
  }

  canUndo(): boolean {
    return this._undoStack.length !== 0;
  }

  canRedo(): boolean {
    return this._redoStack.length !== 0;
  }

  isUndoing(): boolean {
    return this._state === UndoManagerState.Undoing;
  }

  isRedoing(): boolean {
    return this._state === UndoManagerState.Redoing;
  }
}
