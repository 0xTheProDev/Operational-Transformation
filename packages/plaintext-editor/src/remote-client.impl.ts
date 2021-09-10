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

import { IDisposable } from "@operational-transformation/types";
import { ICursor } from "./cursor";
import { IEditorAdapter } from "./editor-adapter";
import { IRemoteClient } from "./remote-client";

/**
 * @internal
 * Remote Client - Client Objects against each Remote User connected to same Server.
 *
 * @param clientId - Unique Identifier for Remote User.
 * @param editorAdapter - Plain Text Editor instance wrapped in Editor Adapter interface.
 */
export class RemoteClient implements IRemoteClient {
  protected readonly _clientId: string;
  protected readonly _editorAdapter: IEditorAdapter;

  protected _userName: string = "";
  protected _userColor: string = "";
  protected _userCursor: ICursor | null = null;
  protected _mark: IDisposable | null = null;

  constructor(clientId: string, editorAdapter: IEditorAdapter) {
    this._clientId = clientId;
    this._editorAdapter = editorAdapter;
  }

  setColor(color: string): void {
    this._userColor = color;
  }

  setUserName(userName: string): void {
    this._userName = userName;
  }

  updateCursor(cursor: ICursor): void {
    this._userCursor = cursor;
    this._mark = this._editorAdapter.setOtherCursor({
      cursor,
      clientId: this._clientId,
      userColor: this._userColor,
      userName: this._userName,
    });
  }

  removeCursor(): void {
    /* istanbul ignore else */
    if (this._mark) {
      this._mark.dispose();
    }
  }
}
