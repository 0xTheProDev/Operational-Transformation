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

import { IDisposable } from "@otjs/types";
import * as monaco from "monaco-editor";

/**
 * @internal
 * Constructor Parameter of Cursor Widget.
 */
export type TCursorWidgetConstructionOptions = {
  /** Monaco Editor instance. */
  editor: monaco.editor.IStandaloneCodeEditor;
  /** Unique User Id whom the Cursor/Selection belongs to */
  clientId: string;
  /** Classname for the Cursor/Selection */
  className: string;
  /** Duration (in ms) of visibility */
  duration: number;
  /** Position of the Cursor/Selection */
  range: monaco.Range;
  /** Name/Short Name of the user (optional). */
  userName?: string;
};

/**
 * @internal
 * Cursor Widget - To show tooltip like UI with Username beside Cursor.
 */
export interface ICursorWidget
  extends monaco.editor.IContentWidget,
    IDisposable {
  /**
   * Update Range of the Cursor Widget.
   * @param range - Range of the Cursor/Selection.
   */
  updateRange(range: monaco.Range): void;
  /**
   * Update User Name of the remote user.
   * @param userName - User Name.
   */
  updateUserName(userName: string): void;
}
