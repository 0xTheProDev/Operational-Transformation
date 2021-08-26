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

import mitt, { Emitter, Handler } from "mitt";
import {
  IPlainTextOperation,
  ITextOperation,
} from "@operational-transformation/plaintext";
import { assert } from "@operational-transformation/utils";
import { IDisposable } from "@operational-transformation/types";
import { ICursor } from "../src/cursor";
import {
  EditorAdapterEvent,
  IEditorAdapter,
  TEditorAdapterChange,
  TEditorAdapterEventArgs,
} from "../src/editor-adapter";
import { clearMock, resetMock } from "./test-utils";

assert(jest != null, "This factories can only be imported in Test environment");

type TMockEditorAdapterEventArgs = TEditorAdapterEventArgs & {
  undo: void;
  redo: void;
};

const emitter: Emitter<TMockEditorAdapterEventArgs> = mitt();

export interface IMockEditorAdapter extends IEditorAdapter {
  /** Trigger an event with optional payload. */
  emit<Key extends keyof TMockEditorAdapterEventArgs>(
    event: Key,
    payload?: TMockEditorAdapterEventArgs[Key]
  ): void;
  /** Disposes cursor inside editor Adapter */
  disposeCursor(): void;
  /** Returns original editor instance */
  getEditor(): any;
}

const disposeRemoteCursorStub = jest.fn<void, []>();
let currentCursor: ICursor | null = null;
let content: string = "";
let editorInstance: any;

const applyOperation = (operation: IPlainTextOperation) => {
  const contentArray = [...content];
  const ops = operation.entries();

  let index = 0;
  let opValue: IteratorResult<[number, ITextOperation]>;

  while (!(opValue = ops.next()).done) {
    const op: ITextOperation = opValue.value[1];

    switch (true) {
      case op.isDelete():
        contentArray.splice(index, op.characterCount());
        break;

      case op.isInsert():
        contentArray.splice(index, 0, ...[...op.textContent()]);
        index += op.textContent().length;
        break;

      case op.isRetain():
        index += op.characterCount();
        break;
    }
  }

  content = contentArray.join("");
};

// @ts-expect-error
const editorAdapter: IMockEditorAdapter = Object.freeze({
  on: jest.fn<
    void,
    [
      EditorAdapterEvent,
      Handler<TMockEditorAdapterEventArgs[EditorAdapterEvent]>
    ]
  >((ev, handler) => {
    emitter.on(ev, handler);
  }),
  off: jest.fn<
    void,
    [
      EditorAdapterEvent,
      Handler<TMockEditorAdapterEventArgs[EditorAdapterEvent]>
    ]
  >((ev, handler) => {
    emitter.off(ev, handler);
  }),
  emit: jest.fn<
    void,
    [EditorAdapterEvent, TMockEditorAdapterEventArgs[EditorAdapterEvent]]
  >((ev, payload) => {
    emitter.emit(ev, payload);
  }),
  registerUndo: jest.fn<void, [Handler<void>]>((handler) => {
    emitter.on("undo", handler);
  }),
  registerRedo: jest.fn<void, [Handler<void>]>((handler) => {
    emitter.on("redo", handler);
  }),
  deregisterUndo: jest.fn<void, [Handler<void>]>((handler) => {
    emitter.off("undo", handler);
  }),
  deregisterRedo: jest.fn<void, [Handler<void>]>((handler) => {
    emitter.off("redo", handler);
  }),
  dispose: jest.fn<void, []>(() => {
    emitter.all.clear();
  }),
  setInitiated: jest.fn<void, [boolean]>(),
  getCursor: jest.fn<ICursor | null, []>(() => currentCursor),
  setCursor: jest.fn<void, [ICursor]>((cursor) => {
    currentCursor = cursor;
  }),
  setOtherCursor: jest.fn<
    IDisposable,
    [string, ICursor, string, string | undefined]
  >(() => ({
    dispose: disposeRemoteCursorStub,
  })),
  disposeCursor: disposeRemoteCursorStub,
  getEditor: jest.fn<any, []>(() => editorInstance),
  getText: jest.fn<string, []>(() => content),
  setText: jest.fn<void, [string]>((text) => {
    content = text;
  }),
  applyOperation: jest.fn<void, [IPlainTextOperation]>((operation) => {
    applyOperation(operation);
  }),
  invertOperation: jest.fn<IPlainTextOperation, [IPlainTextOperation]>(
    (operation) => operation.invert(content)
  ),
});

afterEach(() => {
  clearMock(editorAdapter);
});

afterAll(() => {
  // @ts-expect-error
  emitter = null;
  editorInstance = null;
  currentCursor = null;
  resetMock(editorAdapter);
});

/**
 * Returns a mock implementation of IEditorAdapter interface.
 * Useful for testing Editor Client, Firepad and related helper functions.
 */
export function getEditorAdapter(editor: any = null): IMockEditorAdapter {
  if (!editorInstance) {
    editorInstance = editor;
  }

  return editorAdapter;
}
