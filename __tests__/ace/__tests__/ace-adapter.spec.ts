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

import {
  Cursor,
  EditorAdapterEvent,
  IEditorAdapter,
} from "@otjs/plaintext-editor";
import { PlainTextOperation } from "@otjs/plaintext";
import { AceAdapter } from "@otjs/ace/src/ace-adapter";

/**
 * Range Constructor for Ace Editor
 */
const Range: typeof AceAjax.Range = ace.require("ace/range").Range;

describe("Test Ace Adapter", () => {
  let aceEditor: AceAjax.Editor, aceAdapter: IEditorAdapter;

  const text = "Some Random\nText in\n\t\t\tthe middle\nof the screen\n";
  const [undoCallbackFn, redoCallbackFn] = [jest.fn(), jest.fn()];

  beforeAll(() => {
    const containerEl = document.createElement("div");
    document.body.appendChild(containerEl);
    aceEditor = ace.edit(containerEl);
    aceAdapter = new AceAdapter({
      editor: aceEditor,
      bindEvents: true,
    });
  });

  afterAll(() => {
    aceAdapter.dispose();
    aceEditor.destroy();
  });

  describe("@events", () => {
    it("should return true when constructed with bindEvents param", () => {
      expect(aceAdapter.events).toBe(true);
    });

    it("should throw error if tried to set to any value other than boolean", () => {
      expect(() => {
        // @ts-expect-error
        aceAdapter.events = "Test";
      }).toThrow();
    });

    it("should not throw error if tried to set to the same value", () => {
      expect(() => {
        aceAdapter.events = true;
      }).not.toThrow();
    });

    it("should dispose all listeners if set to false", () => {
      aceAdapter.events = false;
      expect(aceAdapter.events).toBe(false);
    });

    it("should initialise all listeners if set to true", () => {
      aceAdapter.events = true;
      expect(aceAdapter.events).toBe(true);
    });
  });

  describe("#registerUndo", () => {
    it("should overwrite undo handler of Monaco model with callback given", () => {
      aceAdapter.registerUndo(undoCallbackFn);
      expect(aceEditor.undo).toBe(undoCallbackFn);
    });
  });

  describe("#registerRedo", () => {
    it("should overwrite redo handler of Monaco model with callback given", () => {
      aceAdapter.registerRedo(redoCallbackFn);
      expect(aceEditor.redo).toBe(redoCallbackFn);
    });
  });

  describe("#deregisterUndo", () => {
    it("should do nothing if unregistered handler is passed", () => {
      const undoCallbackFn2 = jest.fn();
      aceAdapter.deregisterUndo(undoCallbackFn2);
      expect(aceEditor.undo).toBe(undoCallbackFn);
    });

    it("should reset undo handler of Monaco model", () => {
      aceAdapter.deregisterUndo(); // Passing `undoCallbackFn` as param should yield same effect
      expect(aceEditor.undo).not.toBe(undoCallbackFn);
    });
  });

  describe("#deregisterRedo", () => {
    it("should do nothing if unregistered handler is passed", () => {
      const redoCallbackFn2 = jest.fn();
      aceAdapter.deregisterRedo(redoCallbackFn2);
      expect(aceEditor.redo).toBe(redoCallbackFn);
    });

    it("should reset redo handler of Monaco model", () => {
      aceAdapter.deregisterRedo(); // Passing `redoCallbackFn` as param should yield same effect
      expect(aceEditor.redo).not.toBe(redoCallbackFn);
    });
  });

  describe("#getCursor", () => {
    let aceSession: AceAjax.IEditSession, aceDocument: AceAjax.Document;

    beforeAll(() => {
      aceSession = aceEditor.getSession();
      aceDocument = aceSession.getDocument();
      aceDocument.setValue(text);
    });

    it("return Cursor object from current cursor position in the editor", () => {
      const [start, end] = [3, 9];
      const [positionStart, positionEnd] = [
        aceDocument.indexToPosition(start, 0),
        aceDocument.indexToPosition(end, 0),
      ];
      aceSession.selection.setSelectionRange(
        new Range(
          positionStart.row,
          positionStart.column,
          positionEnd.row,
          positionEnd.column
        )
      );
      expect(aceAdapter.getCursor()).toEqual(new Cursor(start, end));
    });

    it("return Cursor object even if cursor position is reversed", () => {
      const [start, end] = [8, 4];
      const [positionStart, positionEnd] = [
        aceDocument.indexToPosition(start, 0),
        aceDocument.indexToPosition(end, 0),
      ];
      aceSession.selection.setSelectionRange(
        new Range(
          positionStart.row,
          positionStart.column,
          positionEnd.row,
          positionEnd.column
        )
      );
      expect(aceAdapter.getCursor()).toEqual(new Cursor(end, start));
    });
  });

  describe("#setCursor", () => {
    let aceSession: AceAjax.IEditSession, aceDocument: AceAjax.Document;

    beforeAll(() => {
      aceSession = aceEditor.getSession();
      aceDocument = aceSession.getDocument();
      aceDocument.setValue(text);
    });

    it("should set cursor position in the editor", () => {
      const [start, end] = [2, 6];
      aceAdapter.setCursor(new Cursor(start, end));
      const [selectionStart, selectionEnd] = [
        aceDocument.positionToIndex(aceSession.selection.getRange().start),
        aceDocument.positionToIndex(aceSession.selection.getRange().end),
      ];
      expect([selectionStart, selectionEnd]).toEqual([start, end]);
    });

    it("should set cursor position in the editor even when reversed", () => {
      const [start, end] = [8, 4];
      aceAdapter.setCursor(new Cursor(start, end));
      const [selectionStart, selectionEnd] = [
        aceDocument.positionToIndex(aceSession.selection.getRange().start),
        aceDocument.positionToIndex(aceSession.selection.getRange().end),
      ];
      expect([selectionStart, selectionEnd]).toEqual([end, start]);
    });
  });

  describe("#setOtherCursor", () => {
    let aceSession: AceAjax.IEditSession, aceDocument: AceAjax.Document;

    beforeAll(() => {
      aceSession = aceEditor.getSession();
      aceDocument = aceSession.getDocument();
    });

    it("should throw error if invalid parameter passed as cursor", () => {
      expect(() =>
        aceAdapter.setOtherCursor({
          // @ts-expect-error
          cursor: null,
        })
      ).toThrow();
    });

    it("should throw error if invalid parameter passed as clientId", () => {
      expect(() =>
        aceAdapter.setOtherCursor({
          // @ts-expect-error
          clientId: 23,
          cursor: new Cursor(3, 3),
        })
      ).toThrow();
    });

    it("should throw error if invalid parameter passed as user color", () => {
      expect(() =>
        aceAdapter.setOtherCursor({
          // @ts-expect-error
          userColor: null,
          clientId: "user2",
          cursor: new Cursor(2, 7),
        })
      ).toThrow();
    });

    it("should add cursor for remote user into the editor", () => {
      aceAdapter.setOtherCursor({
        userColor: "#09c",
        clientId: "user2",
        cursor: new Cursor(3, 3),
      });

      const markers = aceSession.getMarkers(false);
      expect(Object.values(markers)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            clazz: "remote-client-09c-cursor",
            inFront: false,
          }),
        ])
      );
    });

    it("should add selection for remote user into the editor", () => {
      aceAdapter.setOtherCursor({
        userColor: "#0ff",
        clientId: "user3",
        cursor: new Cursor(3, 5),
      });

      const markers = aceSession.getMarkers(false);
      expect(Object.values(markers)).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: "text",
            clazz: "remote-client-0ff-selection",
            inFront: false,
          }),
        ])
      );
    });

    it("returns a Disposable to clean up cursor/selection from the editor", () => {
      const disposable = aceAdapter.setOtherCursor({
        userColor: "#0ee",
        clientId: "user4",
        cursor: new Cursor(4, 4),
      });

      disposable.dispose();
      const markers = aceSession.getMarkers(false);
      expect(Object.values(markers)).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            type: "text",
            clazz: "remote-client-09c-cursor",
            inFront: false,
          }),
        ])
      );
    });
  });

  describe("#getText", () => {
    it("should return current content of the editor", () => {
      aceEditor.setValue(text);
      expect(aceAdapter.getText()).toBe(text);
    });
  });

  describe("#setText", () => {
    it("should set content to the editor", () => {
      const text2 = "Hello World!";
      aceAdapter.setText(text2);
      expect(aceEditor.getValue()).toBe(text2);
    });
  });

  describe("#setInitiated", () => {
    it("should clean up any content before applying operations", () => {
      aceAdapter.setInitiated();
      expect(aceEditor.getValue()).toBe("");
    });
  });

  describe("#applyOperation", () => {
    beforeAll(() => {
      aceEditor.setValue("");
    });

    afterAll(() => {
      aceEditor.setValue("");
    });

    it("should do nothing if the operation has no effect", () => {
      const operation = new PlainTextOperation();
      aceAdapter.applyOperation(operation);
      expect(aceEditor.getValue()).toBe("");
    });

    it("should apply insert operation to the editor", () => {
      const operation = new PlainTextOperation().insert("Hello World!");
      aceAdapter.applyOperation(operation);
      expect(aceEditor.getValue()).toBe("Hello World!");
    });

    it("should apply delete operation to the editor", () => {
      const operation = new PlainTextOperation()
        .delete("Hello")
        .insert("Good Morning,")
        .retain(6);
      aceAdapter.applyOperation(operation);
      expect(aceEditor.getValue()).toBe("Good Morning, World!");
    });

    it("should apply operation even when the editor is read-only", () => {
      aceEditor.setReadOnly(true);
      const operation = new PlainTextOperation()
        .insert("Hello")
        .delete("Good Morning,")
        .retain(6);
      aceAdapter.applyOperation(operation);
      expect(aceEditor.getValue()).toBe("Hello World!");
      aceEditor.setReadOnly(false);
    });
  });

  describe("#invertOperation", () => {
    beforeAll(() => {
      aceEditor.setValue("Good Morning, World!");
    });

    it("return invert operation based on current content in the editor", () => {
      const operation = new PlainTextOperation()
        .insert("Hello")
        .delete("Good Morning,")
        .retain(6);
      const inverse = new PlainTextOperation()
        .delete("Hello")
        .insert("Good Morning,")
        .retain(6);
      expect(aceAdapter.invertOperation(operation)).toEqual(inverse);
    });
  });

  // describe("#onBlur", () => {
  //   const onBlurFn = jest.fn();

  //   beforeAll(() => {
  //     aceAdapter.on(EditorAdapterEvent.Blur, onBlurFn);
  //   });

  //   afterEach(() => {
  //     onBlurFn.mockClear();
  //   });

  //   afterAll(() => {
  //     aceAdapter.off(EditorAdapterEvent.Blur, onBlurFn);
  //   });

  //   it("should not trigger `Blur` event if selection is present", () => {
  //     aceEditor.blur();
  //     expect(onBlurFn).not.toHaveBeenCalled();
  //   });

  //   it("should trigger `Blur` event when editor is out of focus", () => {
  //     aceEditor.clearSelection();
  //     aceEditor.blur();
  //     expect(onBlurFn).toHaveBeenCalled();
  //   });
  // });

  describe("#onFocus", () => {
    const onFocusFn = jest.fn();

    beforeAll(() => {
      aceAdapter.on(EditorAdapterEvent.Focus, onFocusFn);
    });

    afterAll(() => {
      aceAdapter.off(EditorAdapterEvent.Focus, onFocusFn);
    });

    it("should trigger `Focus` event when editor is in focus", () => {
      aceEditor.focus();
      expect(onFocusFn).toHaveBeenCalled();
    });
  });

  describe("#onChange", () => {
    const onChangeFn = jest.fn();
    let aceSession: AceAjax.IEditSession, aceDocument: AceAjax.Document;

    beforeAll(() => {
      aceSession = aceEditor.getSession();
      aceDocument = aceSession.getDocument();
      aceDocument.setValue(text);
      aceAdapter.on(EditorAdapterEvent.Change, onChangeFn);
    });

    afterEach(() => {
      onChangeFn.mockClear();
    });

    afterAll(() => {
      aceAdapter.off(EditorAdapterEvent.Change, onChangeFn);
    });

    it("should trigger `Change` event when editor content changes", () => {
      aceEditor.setValue("Hello");
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().insert("Hello"),
        inverse: new PlainTextOperation().delete("Hello"),
      });
    });

    it("should handle appending at the end of existing content", () => {
      aceDocument.insert(aceDocument.indexToPosition(5, 0), " World");
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().retain(5).insert(" World"),
        inverse: new PlainTextOperation().retain(5).delete(" World"),
      });
    });

    it("should handle deleting at the end of existing content", () => {
      const [start, end] = [
        aceDocument.indexToPosition(5, 0),
        aceDocument.indexToPosition(11, 0),
      ];
      aceDocument.remove(
        new Range(start.row, start.column, end.row, end.column)
      );
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().retain(5).delete(" World"),
        inverse: new PlainTextOperation().retain(5).insert(" World"),
      });
    });
  });

  describe("#onCursorActivity", () => {
    const onCursorActivity = jest.fn();
    let aceSession: AceAjax.IEditSession, aceDocument: AceAjax.Document;

    beforeAll(() => {
      aceSession = aceEditor.getSession();
      aceDocument = aceSession.getDocument();
      aceDocument.setValue(text);
      aceAdapter.on(EditorAdapterEvent.Cursor, onCursorActivity);
    });

    afterAll(() => {
      aceAdapter.off(EditorAdapterEvent.Cursor, onCursorActivity);
    });

    it("should trigger `Cursor` event when cursor is moved inside the editor", () => {
      const [start, end] = [3, 9];
      const [positionStart, positionEnd] = [
        aceDocument.indexToPosition(start, 0),
        aceDocument.indexToPosition(end, 0),
      ];
      aceSession.selection.setSelectionRange(
        new Range(
          positionStart.row,
          positionStart.column,
          positionEnd.row,
          positionEnd.column
        )
      );
      expect(onCursorActivity).toHaveBeenCalled();
    });
  });
});
