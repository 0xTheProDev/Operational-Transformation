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
import { AceAdapter } from "@otjs/ace";
import { FirebaseAdapter } from "@otjs/firebase-plaintext";
import {
  EditorClient,
  IDatabaseAdapter,
  IEditorAdapter,
  IEditorClient,
  TEditorClientEventArgs,
} from "@otjs/plaintext-editor";
import { IEventHandler } from "@otjs/types";
import {
  IFireAceEditor,
  TFireAceEditorConstructionOptions,
} from "./firebase-ace";

/**
 * @public
 * FireAce Editor Implementation - Real-time Collaborative Editor.
 * @param constructorOptions - A Configuration Object consisting Database Reference, Ace Editor Instance and User Information.
 */
export class FireAceEditor implements IFireAceEditor {
  protected readonly _databaseAdapter: IDatabaseAdapter;
  protected readonly _editorAdapter: IEditorAdapter;
  protected readonly _editorClient: IEditorClient;

  protected _disposed: boolean = false;
  protected _userId: string;
  protected _userColor: string;
  protected _userName: string | null = null;

  constructor({
    announcementDuration,
    databaseRef,
    editor,
    userId,
    userColor,
    userName,
  }: TFireAceEditorConstructionOptions) {
    this._databaseAdapter = new FirebaseAdapter({
      databaseRef,
      userId,
      userColor,
      userName,
    });
    this._editorAdapter = new AceAdapter({
      announcementDuration,
      editor,
      bindEvents: true,
    });
    this._editorClient = new EditorClient({
      databaseAdapter: this._databaseAdapter,
      editorAdapter: this._editorAdapter,
    });

    this._userColor = userColor;
    this._userId = userId;
    this._userName = userName ?? null;
  }

  get disposed(): boolean {
    return this._disposed;
  }

  get text(): string {
    if (this._disposed) {
      return "";
    }

    return this._editorAdapter.getText();
  }

  set text(content: string) {
    if (this._disposed) {
      return;
    }

    this._editorAdapter.setText(content);
  }

  get userColor(): string {
    return this._userColor;
  }

  set userColor(userColor: string) {
    if (this._disposed) {
      return;
    }

    this._databaseAdapter.setUserColor(userColor);
    this._userColor = userColor;
  }

  get userId(): string {
    return this._userId;
  }

  set userId(userId: string) {
    if (this._disposed) {
      return;
    }

    this._databaseAdapter.setUserId(userId);
    this._userId = userId;
  }

  get userName(): string {
    return this._userName ?? this._userId;
  }

  set userName(userName: string) {
    if (this._disposed) {
      return;
    }

    this._databaseAdapter.setUserName(userName);
    this._userName = userName;
  }

  clearHistory(): void {
    this._editorClient.clearUndoRedoStack();
  }

  dispose(): void {
    if (this._disposed) {
      return;
    }

    this._editorClient.dispose();
    this._databaseAdapter.dispose();
    this._editorAdapter.dispose();

    // @ts-expect-error
    this._databaseAdapter = null;
    // @ts-expect-error
    this._editorAdapter = null;
    //@ts-expect-error
    this._editorClient = null;

    this._disposed = true;
  }

  isHistoryEmpty(): boolean {
    return this._databaseAdapter.isHistoryEmpty();
  }

  on<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener: IEventHandler<TEditorClientEventArgs[Key]>,
  ): void {
    this._editorClient.on(event, listener);
  }

  off<Key extends keyof TEditorClientEventArgs>(
    event: Key,
    listener?: IEventHandler<TEditorClientEventArgs[Key]>,
  ): void {
    this._editorClient.off(event, listener);
  }
}
