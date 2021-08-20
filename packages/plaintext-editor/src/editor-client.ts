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

import { ITransitionHandler } from "@ot/state-machine";
import { IDisposable } from "@ot/types";
import { Handler } from "mitt";

/**
 * @public
 * Editor Client Events - Wrapper Packages must attach listener to bubble events up.
 */
export enum EditorClientEvent {
  Undo = "undo",
  Redo = "redo",
  Ready = "ready",
  Error = "error",
  Synced = "synced",
}

/**
 * @public
 * Error Object emiited from Editor Client.
 */
export type TEditorClientError = {
  /** Error Object emitted inside Editor Adapter */
  err: Error;
  /** String representation of the Plain Text Operation */
  operation: string;
  /** String representation of the current Document State (optional) */
  document?: string;
  /** Number of Character already Retained when error occured (optional) */
  retain?: number;
  /** Characters omitted from current Operation when error occured (optional) */
  skippedChars?: number;
  /** Size of the Editor Content when error occured (optional) */
  contentLength?: number;
};

/**
 * @internal
 * Event Arguments for Editor Client Events.
 */
export type TEditorClientEventArgs = {
  [EditorClientEvent.Error]: TEditorClientError;
  [EditorClientEvent.Redo]: string;
  [EditorClientEvent.Ready]: boolean;
  [EditorClientEvent.Synced]: boolean;
  [EditorClientEvent.Undo]: string;
};

/**
 * @public
 * Editor Client Interface - Public APIs to interact with Collaborative Editor.
 */
export interface IEditorClient extends IDisposable, ITransitionHandler {
  /**
   * Add listener to Editor Client.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener: Handler<TEditorClientEventArgs[Key]>
  ): void;
  /**
   * Remove listener to Editor Client.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener?: Handler<TEditorClientEventArgs[Key]>
  ): void;
  /**
   * Clears undo redo stack of current Editor model.
   */
  clearUndoRedoStack(): void;
}

export { IDisposable };
