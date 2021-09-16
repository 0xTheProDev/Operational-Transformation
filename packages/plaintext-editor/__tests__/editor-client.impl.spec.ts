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

import { Handler } from "mitt";
import { PlainTextOperation } from "@otjs/plaintext";
import { Cursor } from "../src/cursor.impl";
import {
  DatabaseAdapterEvent,
  IDatabaseAdapter,
} from "../src/database-adapter";
import { EditorAdapterEvent, IEditorAdapter } from "../src/editor-adapter";
import { EditorClientEvent, IEditorClient } from "../src/editor-client";
import { EditorClient } from "../src/editor-client.impl";
import {
  getDatabaseAdapter,
  getEditorAdapter,
  IMockDatabaseAdapter,
  IMockEditorAdapter,
} from "../__mocks__";

describe("Editor Client", () => {
  let databaseAdapter: IMockDatabaseAdapter;
  let editorAdapter: IMockEditorAdapter;
  let editorClient: IEditorClient;
  let eventListenerStub: Handler<unknown>;

  beforeAll(() => {
    databaseAdapter = getDatabaseAdapter();
    editorAdapter = getEditorAdapter();
    eventListenerStub = jest.fn();
  });

  beforeEach(() => {
    editorClient = new EditorClient(
      databaseAdapter as IDatabaseAdapter,
      editorAdapter as IEditorAdapter
    );
  });

  afterEach(() => {
    editorClient.dispose();
  });

  describe("#on", () => {
    it("should attach event listener to emitter for valid event", () => {
      const fn = () =>
        editorClient.on(EditorClientEvent.Synced, eventListenerStub);
      expect(fn).not.toThrow();
    });
  });

  describe("#off", () => {
    it("should detach event listener to emitter for valid event", () => {
      const fn = () =>
        editorClient.off(EditorClientEvent.Synced, eventListenerStub);
      expect(fn).not.toThrow();
    });
  });

  describe("#clearUndoRedoStack", () => {
    it("should clean up undo stack", () => {
      const initialContent = "";
      const operation = new PlainTextOperation().insert("Hello World");
      const inverse = operation.invert(initialContent);
      editorClient.on(EditorClientEvent.Undo, eventListenerStub);
      editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
      databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      editorClient.clearUndoRedoStack();
      editorAdapter.emit("undo");
      expect(eventListenerStub).not.toHaveBeenCalled();
    });

    it("should clean up redo stack", () => {
      const initialContent = "";
      const operation = new PlainTextOperation().insert("Hello World");
      const inverse = operation.invert(initialContent);
      editorClient.on(EditorClientEvent.Redo, eventListenerStub);
      editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
      databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      editorAdapter.emit("undo");
      databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      editorClient.clearUndoRedoStack();
      editorAdapter.emit("redo");
      expect(eventListenerStub).not.toHaveBeenCalled();
    });
  });

  describe("#dispose", () => {
    it("should not allow any syncing after client have been disposed", () => {
      editorClient.dispose();
      const initialContent = "";
      const operation = new PlainTextOperation().insert("Hello World");
      const inverse = operation.invert(initialContent);
      editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
      expect(databaseAdapter.sendOperation).not.toHaveBeenCalled();
    });
  });

  describe("_databaseAdapter", () => {
    describe("#onReady", () => {
      it("should emit Ready event once Database adapter is ready", (done) => {
        editorClient.on(EditorClientEvent.Ready, (isReady) => {
          expect(isReady).toEqual(true);
          done();
        });

        databaseAdapter.emit(DatabaseAdapterEvent.Ready);
      });
    });

    describe("#onAck", () => {
      it("should emit Synced event once Acknowledgement from Database is received", (done) => {
        editorClient.on(EditorClientEvent.Synced, (isSynced) => {
          expect(isSynced).toEqual(true);
          done();
        });

        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      });

      it("should send current cursor position to Database adapter", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        expect(databaseAdapter.sendCursor).toHaveBeenCalled();
      });
    });

    describe("#onOperation", () => {
      it("should apply operation to Editor adapter", () => {
        const initialContent = "";
        editorAdapter.setText(initialContent);
        const operation = new PlainTextOperation().insert("Hello World");
        databaseAdapter.emit(DatabaseAdapterEvent.Operation, operation);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(operation);
      });
    });

    describe("#onRetry", () => {
      it("should resend operation to Database adapter", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Retry);
        expect(databaseAdapter.sendOperation).toHaveBeenNthCalledWith(
          2,
          operation
        );
      });
    });

    describe("#onInitialRevision", () => {
      it("should mark Editor adapter ready for handle onChange", () => {
        databaseAdapter.emit(DatabaseAdapterEvent.InitialRevision);
        expect(editorAdapter.setInitiated).toHaveBeenCalled();
      });
    });

    describe("#onCursor", () => {
      const clientId = "SomeOtherClient";

      it("should update cursor position in Editor adapter for remote users", () => {
        const cursor = new Cursor(5, 9);
        const userColor = "#00f0f3";
        const userName = "User";
        databaseAdapter.emit(DatabaseAdapterEvent.CursorChange, {
          clientId,
          cursor: cursor.toJSON(),
          userColor,
          userName,
        });
        expect(editorAdapter.setOtherCursor).toHaveBeenCalledWith({
          clientId,
          cursor,
          userColor,
          userName,
        });
      });

      it("should remove cursor from Editor adapter for remote users", () => {
        const cursor = new Cursor(15, 29);
        const userColor = "#00f0f3";
        const userName = "User";
        databaseAdapter.emit(DatabaseAdapterEvent.CursorChange, {
          clientId,
          cursor: cursor.toJSON(),
          userColor,
          userName,
        });
        databaseAdapter.emit(DatabaseAdapterEvent.CursorChange, {
          clientId,
          cursor: null,
        });
        expect(editorAdapter.disposeCursor).toHaveBeenCalled();
      });
    });

    describe("#onError", () => {
      it("should bubble up error message with additional attributes", (done) => {
        const err = new Error("Something Went Wrong");
        const operation = new PlainTextOperation().retain(100).toString();
        const state = {
          document: "",
        };

        editorClient.on(EditorClientEvent.Error, (arg) => {
          expect(arg).toEqual({ err, operation, ...state });
          done();
        });

        databaseAdapter.emit(DatabaseAdapterEvent.Error, {
          err,
          operation,
          ...state,
        });
      });
    });
  });

  describe("_editorAdapter", () => {
    describe("#onBlur", () => {
      it("should send null as cursor to Database adapter", () => {
        editorAdapter.emit(EditorAdapterEvent.Blur);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(null);
      });
    });

    describe("#onFocus", () => {
      it("should not make any Database call if cursor position is same as before", () => {
        editorAdapter.emit(EditorAdapterEvent.Focus);
        expect(databaseAdapter.sendCursor).not.toHaveBeenCalled();
      });

      it("should send cursor to Database adapter", () => {
        const cursor = new Cursor(4, 9);
        editorAdapter.setCursor(cursor);
        editorAdapter.emit(EditorAdapterEvent.Focus);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(cursor);
      });
    });

    describe("#onCursorActivity", () => {
      it("should send cursor to Database adapter", () => {
        const cursor = new Cursor(6, 7);
        editorAdapter.setCursor(cursor);
        editorAdapter.emit(EditorAdapterEvent.Cursor);
        expect(databaseAdapter.sendCursor).toHaveBeenCalledWith(cursor);
      });

      it("should postpone sending if an operation is pending on client", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, {
          operation,
          inverse,
        });
        editorAdapter.emit("undo");
        editorAdapter.setCursor(new Cursor(10, 12));
        editorAdapter.emit(EditorAdapterEvent.Cursor);

        expect(databaseAdapter.sendCursor).not.toHaveBeenCalled();

        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      });
    });

    describe("#onChange", () => {
      it("should send operation to Database adapter", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        expect(databaseAdapter.sendOperation).toHaveBeenCalledWith(operation);
      });
    });

    describe("#onError", () => {
      it("should bubble up error message with additional attributes", (done) => {
        const err = new Error("Something Went Wrong");
        const operation = new PlainTextOperation().retain(100).toString();
        const state = {
          retain: 20,
        };

        editorClient.on(EditorClientEvent.Error, (arg) => {
          expect(arg).toEqual({ err, operation, ...state });
          done();
        });

        editorAdapter.emit(EditorAdapterEvent.Error, {
          err,
          operation,
          ...state,
        });
      });
    });

    describe("#registerUndo", () => {
      it("should trigger undo event with stringified invert operation", (done) => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorClient.on(EditorClientEvent.Undo, (arg) => {
          expect(arg).toEqual(inverse.toString());
          done();
        });
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.emit("undo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      });

      it("should apply invert operation to editor adapter", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.emit("undo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(inverse);
      });
    });

    describe("#registerRedo", () => {
      it("should trigger redo event with stringified invert of invert operation", (done) => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });

        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.emit("undo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        const currentContent = editorAdapter.getText();
        editorClient.on(EditorClientEvent.Redo, (arg) => {
          expect(arg).toEqual(inverse.invert(currentContent).toString());
          done();
        });
        editorAdapter.emit("redo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
      });

      it("should apply invert of invert operation to editor adapter", () => {
        const initialContent = "";
        const operation = new PlainTextOperation().insert("Hello World");
        const inverse = operation.invert(initialContent);
        editorAdapter.emit(EditorAdapterEvent.Change, { operation, inverse });
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        editorAdapter.emit("undo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        const currentContent = editorAdapter.getText();
        editorAdapter.emit("redo");
        databaseAdapter.emit(DatabaseAdapterEvent.Acknowledge);
        expect(editorAdapter.applyOperation).toHaveBeenCalledWith(
          inverse.invert(currentContent)
        );
      });
    });
  });
});
