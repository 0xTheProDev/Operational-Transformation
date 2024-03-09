/**
 * Copyright © 2021 - 2024 Progyan Bhattacharya
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

import { TFirebaseAdapterConstructionOptions } from "@otjs/firebase-plaintext";
import { TMonacoAdapterConstructionOptions } from "@otjs/monaco";
import {
  EditorClientEvent,
  TEditorClientEventArgs,
} from "@otjs/plaintext-editor";
import { IDisposable, IEventEmitter } from "@otjs/types";

/**
 * @public
 * Constructor Options to instantiate a FireMonaco Editor.
 */
export type TFireMonacoEditorConstructionOptions =
  TFirebaseAdapterConstructionOptions &
    Omit<TMonacoAdapterConstructionOptions, "bindEvents">;

/**
 * @public
 * FireMonaco Editor Interface - Public APIs to interact with Collaborative Editor.
 */
export interface IFireMonacoEditor
  extends IDisposable,
    IEventEmitter<EditorClientEvent, TEditorClientEventArgs> {
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
}

export { IDisposable, IEventEmitter };
