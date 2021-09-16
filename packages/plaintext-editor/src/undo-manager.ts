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
import { IDisposable } from "@otjs/types";
import { Handler } from "mitt";
import { IWrappedOperation } from "./wrapped-operation";

/**
 * @internal
 * Undo Redo Stack Manager to handle Undo and Redo events in Plain Text Editor.
 */
export interface IUndoManager extends IDisposable {
  /**
   * Add an operation to the undo or redo stack, depending on the current state
   * of the UndoManager. The operation added must be the inverse of the last
   * edit. When `compose` is true, compose the operation with the last operation
   * unless the last operation was alread pushed on the redo stack or was hidden
   * by a newer operation on the undo stack.
   */
  add(operation: IPlainTextOperation, compose?: boolean): void;
  /**
   * Returns last entry in the undo stack if exists.
   */
  last(): IWrappedOperation | null;
  /**
   * Transform the undo and redo stacks against a operation by another client.
   */
  transform(operation: IPlainTextOperation): void;
  /**
   * Perform an undo by calling a function with the latest operation on the undo
   * stack. The function is expected to call the `add` method with the inverse
   * of the operation, which pushes the inverse on the redo stack.
   */
  performUndo(callback: Handler<IWrappedOperation>): void;
  /**
   * Perform a redo by calling a function with the latest operation on the redo
   * stack. The function is expected to call the `add` method with the inverse
   * of the operation, which pushes the inverse on the undo stack.
   */
  performRedo(callback: Handler<IWrappedOperation>): void;
  /**
   * Is the undo stack not empty?
   */
  canUndo(): boolean;
  /**
   * Is the redo stack not empty?
   */
  canRedo(): boolean;
  /**
   * Whether the UndoManager is currently performing an undo.
   */
  isUndoing(): boolean;
  /**
   * Whether the UndoManager is currently performing a redo.
   */
  isRedoing(): boolean;
}
