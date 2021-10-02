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

import { TAceAdapterConstructionOptions } from "@otjs/ace";
import { TFirebaseAdapterConstructionOptions } from "@otjs/firebase-plaintext";
import { TEditorClientEventArgs } from "@otjs/plaintext-editor";
import { IDisposable } from "@otjs/types";
import { Handler } from "mitt";

/**
 * @public
 * Constructor Options to instantiate a FireAce Editor.
 */
export type TFireAceEditorConstructionOptions =
  TFirebaseAdapterConstructionOptions & TAceAdapterConstructionOptions;

/**
 * @public
 * FireAce Editor Interface - Public APIs to interact with Collaborative Editor.
 */
export interface IFireAceEditor extends IDisposable {
  /** Returns if the Editor has already been disposed. */
  disposed: boolean;
  /** Returns Text Content of the Editor. Can be used to both get and set. Returns empty string if already disposed. */
  text: string;
  /** Returns Unique Color code of the current User. Can be used to both get and set. */
  userColor: string;
  /** Returns Unique Id of the current User. Can be used to both get and set. */
  userId: string;
  /** Returns Name/Short Name of the current User. Can be used to both get and set. */
  userName: string | void;
  /** Clear user's Edit History so far to freeze Undo/Redo till further operation. */
  clearHistory(): void;
  /**
   * Returns false if at least one operation has been performed after initialisation for the first time, True otherwise.
   */
  isHistoryEmpty(): boolean;
  /**
   * Add listener to FireAce Editor.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener: Handler<TEditorClientEventArgs[Key]>
  ): void;
  /**
   * Remove listener to FireAce Editor.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener?: Handler<TEditorClientEventArgs[Key]>
  ): void;
}

export { IDisposable };
