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

import { IPlainTextOperation } from "@ot/plaintext";
import { IDisposable } from "@ot/types";
import { Handler } from "mitt";
import { ICursor } from "./cursor";

/**
 * @public
 * Editor Adapter Events - Events exposed by Editor Adapter.
 */
export enum EditorAdapterEvent {
  Error = "error",
  Blur = "blur",
  Focus = "focus",
  Change = "change",
  Cursor = "cursor",
}

/**
 * @public
 * Change Object emiited from Editor Adapter.
 */
export type TEditorAdapterChange = {
  operation: IPlainTextOperation;
  inverse: IPlainTextOperation;
};

/**
 * @public
 * Error Object emiited from Editor Adapter.
 */
export type TEditorAdapterError = {
  /** Error Object emitted inside Editor Adapter */
  err: Error;
  /** String representation of the Plain Text Operation */
  operation: string;
  /** Number of Character already Retained when error occured (optional) */
  retain?: number;
  /** Characters omitted from current Operation when error occured (optional) */
  skippedChars?: number;
  /** Size of the Editor Content when error occured (optional) */
  contentLength?: number;
};

/**
 * @internal
 * Event Arguments for Editor Adapter Events.
 */
export type TEditorAdapterEventArgs = {
  [EditorAdapterEvent.Blur]: void;
  [EditorAdapterEvent.Change]: TEditorAdapterChange;
  [EditorAdapterEvent.Cursor]: void;
  [EditorAdapterEvent.Error]: TEditorAdapterError;
  [EditorAdapterEvent.Focus]: void;
};

/**
 * @public
 * Incoming Parameter for Remote User Cursor
 */
export type TEditorAdapterCursorParams = {
  /** Remote User ID. */
  clientId: string;
  /** Cursor instance of Remote User. */
  cursor: ICursor | null;
  /** HexaDecimal Color Code for Cursor/Selection. */
  userColor?: string;
  /** User Name to show on Cursor (optional). */
  userName?: string;
};

/**
 * @public
 * Editor Adapter Interface - This Interface should be implemented over Plain Text Editor to have OT functionalities.
 */
export interface IEditorAdapter extends IDisposable {
  /**
   * Add listener to Editor Adapter.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener: Handler<TEditorAdapterEventArgs[Key]>
  ): void;
  /**
   * Remove listener to Editor Adapter.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener?: Handler<TEditorAdapterEventArgs[Key]>
  ): void;
  /**
   * Add Undo callback to maintain sync while doing Undo in Plain Text Editor.
   * @param callback - Undo Event Handler.
   */
  registerUndo(callback: Handler<void>): void;
  /**
   * Add Redo callback to maintain sync while doing Redo in Plain Text Editor.
   * @param callback - Redo Event Handler.
   */
  registerRedo(callback: Handler<void>): void;
  /**
   * Remove Undo callback from Plain Text Editor.
   * @param callback - Undo Event Handler (optional).
   */
  deregisterUndo(callback?: Handler<void>): void;
  /**
   * Remove Redo callback from Plain Text Editor.
   * @param callback - Redo Event Handler (optional).
   */
  deregisterRedo(callback?: Handler<void>): void;
  /**
   * Returns Cursor position of current User in Editor.
   */
  getCursor(): ICursor | null;
  /**
   * Add Cursor position of current User in Editor.
   * @param cursor - Cursor position of Current User.
   */
  setCursor(cursor: ICursor): void;
  /**
   * Add Cursor position of Remote Users in Editor.
   * @param remoteCursorData - Cursor Information about Remote User including Unique Id.
   */
  setOtherCursor(remoteCursorData: TEditorAdapterCursorParams): IDisposable;
  /**
   * Returns current content of the Editor.
   */
  getText(): string;
  /**
   * Sets current content of the Editor.
   * @param text - Text Content.
   */
  setText(text: string): void;
  /**
   * Sets the inititated boolean which in turn allows onChange events to progress
   * @param _initiated - initiated boolean that represent initial firebase Revisions.
   */
  setInitiated(init: boolean): void;
  /**
   * Applies operation into Editor.
   * @param operation - Text Operation.
   */
  applyOperation(operation: IPlainTextOperation): void;
  /**
   * Returns invert operation based on current Editor content
   * @param operation - Text Operation.
   */
  invertOperation(operation: IPlainTextOperation): IPlainTextOperation;
}
