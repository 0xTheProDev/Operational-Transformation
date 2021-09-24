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

import * as monaco from "monaco-editor";
import {
  Cursor,
  EditorAdapterEvent,
  IEditorAdapter,
} from "@otjs/plaintext-editor";
import { PlainTextOperation } from "@otjs/plaintext";
import { ITextModelWithUndoRedo } from "../src/text-model";
import { MonacoAdapter } from "../src/monaco-adapter";

jest.setTimeout(10000 /** 10 seconds */);

describe("Test Monaco Adapter", () => {
  let monacoEditor: monaco.editor.IStandaloneCodeEditor,
    monacoAdapter: IEditorAdapter;

  const text = "Some Random\nText in\n\t\t\tthe middle\nof the screen\n";
  const [undoCallbackFn, redoCallbackFn] = [jest.fn(), jest.fn()];

  beforeAll(() => {
    const containerEl = document.createElement("div");
    document.body.appendChild(containerEl);
    monacoEditor = monaco.editor.create(containerEl, {
      value: text,
    });
    monacoAdapter = new MonacoAdapter({
      editor: monacoEditor,
      bindEvents: true,
    });
  });

  afterAll(() => {
    monacoAdapter.dispose();
    monacoEditor.dispose();
  });

  describe("@events", () => {
    it("should return true when constructed with bindEvents param", () => {
      expect(monacoAdapter.events).toBe(true);
    });

    it("should throw error if tried to set to any value other than boolean", () => {
      expect(() => {
        // @ts-expect-error
        monacoAdapter.events = "Test";
      }).toThrow();
    });

    it("should not throw error if tried to set to the same value", () => {
      expect(() => {
        monacoAdapter.events = true;
      }).not.toThrow();
    });

    it("should dispose all listeners if set to false", () => {
      monacoAdapter.events = false;
      expect(monacoAdapter.events).toBe(false);
    });

    it("should initialise all listeners if set to true", () => {
      monacoAdapter.events = true;
      expect(monacoAdapter.events).toBe(true);
    });
  });

  describe("#registerUndo", () => {
    it("should overwrite undo handler of Monaco model with callback given", () => {
      monacoAdapter.registerUndo(undoCallbackFn);
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.undo).toBe(undoCallbackFn);
    });
  });

  describe("#registerRedo", () => {
    it("should overwrite redo handler of Monaco model with callback given", () => {
      monacoAdapter.registerRedo(redoCallbackFn);
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.redo).toBe(redoCallbackFn);
    });
  });

  describe("#deregisterUndo", () => {
    it("should do nothing if unregistered handler is passed", () => {
      const undoCallbackFn2 = jest.fn();
      monacoAdapter.deregisterUndo(undoCallbackFn2);
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.undo).toBe(undoCallbackFn);
    });

    it("should reset undo handler of Monaco model", () => {
      monacoAdapter.deregisterUndo(); // Passing `undoCallbackFn` as param should yield same effect
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.undo).not.toBe(undoCallbackFn);
    });
  });

  describe("#deregisterRedo", () => {
    it("should do nothing if unregistered handler is passed", () => {
      const redoCallbackFn2 = jest.fn();
      monacoAdapter.deregisterRedo(redoCallbackFn2);
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.redo).toBe(redoCallbackFn);
    });

    it("should reset redo handler of Monaco model", () => {
      monacoAdapter.deregisterRedo(); // Passing `redoCallbackFn` as param should yield same effect
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.redo).not.toBe(redoCallbackFn);
    });
  });

  describe("#getCursor", () => {
    it("return Cursor object from current cursor position in the editor", () => {
      const [start, end] = [3, 15];
      const model = monacoEditor.getModel()!;
      const [positionStart, positionEnd] = [
        model.getPositionAt(start),
        model.getPositionAt(end),
      ];
      monacoEditor.setSelection(
        new monaco.Selection(
          positionStart.lineNumber,
          positionStart.column,
          positionEnd.lineNumber,
          positionEnd.column
        )
      );
      expect(monacoAdapter.getCursor()).toEqual(new Cursor(start, end));
    });

    it("return Cursor object even if cursor position is reversed", () => {
      const [start, end] = [12, 4];
      const model = monacoEditor.getModel()!;
      const [positionStart, positionEnd] = [
        model.getPositionAt(start),
        model.getPositionAt(end),
      ];
      monacoEditor.setSelection(
        new monaco.Selection(
          positionStart.lineNumber,
          positionStart.column,
          positionEnd.lineNumber,
          positionEnd.column
        )
      );
      expect(monacoAdapter.getCursor()).toEqual(new Cursor(end, start));
    });
  });

  describe("#setCursor", () => {
    it("should set cursor position in the editor", () => {
      const [start, end] = [2, 6];
      const cursor = new Cursor(start, end);
      monacoAdapter.setCursor(cursor);
      const model = monacoEditor.getModel()!;
      const selection = monacoEditor.getSelection()!;
      const [selectionStart, selectionEnd] = [
        model.getOffsetAt(selection.getStartPosition()),
        model.getOffsetAt(selection.getEndPosition()),
      ];
      expect([selectionStart, selectionEnd]).toEqual([start, end]);
    });

    it("should set cursor position in the editor even when reversed", () => {
      const [start, end] = [12, 4];
      const cursor = new Cursor(start, end);
      monacoAdapter.setCursor(cursor);
      const model = monacoEditor.getModel()!;
      const selection = monacoEditor.getSelection()!;
      const [selectionStart, selectionEnd] = [
        model.getOffsetAt(selection.getStartPosition()),
        model.getOffsetAt(selection.getEndPosition()),
      ];
      expect([selectionStart, selectionEnd]).toEqual([end, start]);
    });
  });

  describe("#setOtherCursor", () => {
    it("should throw error if invalid parameter passed as cursor", () => {
      expect(() =>
        monacoAdapter.setOtherCursor({
          // @ts-expect-error
          cursor: null,
        })
      ).toThrow();
    });

    it("should throw error if invalid parameter passed as clientId", () => {
      expect(() =>
        monacoAdapter.setOtherCursor({
          // @ts-expect-error
          clientId: 23,
          cursor: new Cursor(3, 3),
        })
      ).toThrow();
    });

    it("should throw error if invalid parameter passed as user color", () => {
      expect(() =>
        monacoAdapter.setOtherCursor({
          // @ts-expect-error
          userColor: null,
          clientId: "user2",
          cursor: new Cursor(2, 7),
        })
      ).toThrow();
    });

    it("should add cursor for remote user into the editor", () => {
      monacoAdapter.setOtherCursor({
        userColor: "#09c",
        clientId: "user2",
        cursor: new Cursor(3, 3),
      });
      const model = monacoEditor.getModel()!;
      const start = model.getPositionAt(3);
      const decoration = model.getDecorationsInRange(
        new monaco.Range(
          start.lineNumber,
          start.column,
          start.lineNumber,
          start.column
        )
      );
      expect(decoration).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            options: expect.objectContaining({
              className: "remote-client-09c-cursor",
              isWholeLine: false,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            }),
          }),
        ])
      );
    });

    it("should add selection for remote user into the editor", () => {
      monacoAdapter.setOtherCursor({
        userColor: "#0ff",
        clientId: "user3",
        cursor: new Cursor(3, 5),
      });
      const model = monacoEditor.getModel()!;
      const [start, end] = [model.getPositionAt(3), model.getPositionAt(5)];
      const decoration = model.getDecorationsInRange(
        new monaco.Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column
        )
      );
      expect(decoration).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            options: expect.objectContaining({
              className: "remote-client-0ff-selection",
              isWholeLine: false,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            }),
          }),
        ])
      );
    });

    it("returns a Disposable to clean up cursor/selection from the editor", () => {
      const disposable = monacoAdapter.setOtherCursor({
        userColor: "#0ee",
        clientId: "user4",
        cursor: new Cursor(4, 4),
      });
      const model = monacoEditor.getModel()!;
      const start = model.getPositionAt(3);
      const decoration = model.getDecorationsInRange(
        new monaco.Range(
          start.lineNumber,
          start.column,
          start.lineNumber,
          start.column
        )
      );

      disposable.dispose();
      expect(decoration).toEqual(
        expect.arrayContaining([
          expect.not.objectContaining({
            options: expect.objectContaining({
              className: "remote-client-0ee-cursor",
              isWholeLine: false,
              stickiness:
                monaco.editor.TrackedRangeStickiness
                  .NeverGrowsWhenTypingAtEdges,
            }),
          }),
        ])
      );
    });
  });

  describe("#getText", () => {
    it("should return current content of the editor", () => {
      monacoEditor.setValue(text);
      expect(monacoAdapter.getText()).toBe(text);
    });
  });

  describe("#setText", () => {
    it("should set content to the editor", () => {
      const text2 = "Hello World!";
      monacoAdapter.setText(text2);
      expect(monacoEditor.getValue()).toBe(text2);
    });
  });

  describe("#setInitiated", () => {
    it("should clean up any content before applying operations", () => {
      monacoAdapter.setInitiated();
      expect(monacoEditor.getValue()).toBe("");
    });
  });

  describe("#applyOperation", () => {
    beforeAll(() => {
      monacoEditor.setValue("");
    });

    afterAll(() => {
      monacoEditor.setValue("");
    });

    it("should do nothing if the operation has no effect", () => {
      const operation = new PlainTextOperation();
      monacoAdapter.applyOperation(operation);
      expect(monacoEditor.getValue()).toBe("");
    });

    it("should apply insert operation to the editor", () => {
      const operation = new PlainTextOperation().insert("Hello World!");
      monacoAdapter.applyOperation(operation);
      expect(monacoEditor.getValue()).toBe("Hello World!");
    });

    it("should apply delete operation to the editor", () => {
      const operation = new PlainTextOperation()
        .delete("Hello")
        .insert("Good Morning,")
        .retain(6);
      monacoAdapter.applyOperation(operation);
      expect(monacoEditor.getValue()).toBe("Good Morning, World!");
    });

    it("should apply operation even when the editor is read-only", () => {
      monacoEditor.updateOptions({ readOnly: true });
      const operation = new PlainTextOperation()
        .insert("Hello")
        .delete("Good Morning,")
        .retain(6);
      monacoAdapter.applyOperation(operation);
      expect(monacoEditor.getValue()).toBe("Hello World!");
      monacoEditor.updateOptions({ readOnly: false });
    });
  });

  describe("#invertOperation", () => {
    beforeAll(() => {
      monacoEditor.setValue("Good Morning, World!");
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
      expect(monacoAdapter.invertOperation(operation)).toEqual(inverse);
    });
  });

  // describe("#onBlur", () => {
  //   const onBlurFn = jest.fn();

  //   beforeAll(() => {
  //     monacoAdapter.on(EditorAdapterEvent.Blur, onBlurFn);
  //   });

  //   afterAll(() => {
  //     monacoAdapter.off(EditorAdapterEvent.Blur, onBlurFn);
  //   });

  //   it("should trigger `Blur` event when editor is out of focus", () => {
  //     TODO: Find a way to trigger Blur event in editor
  //     expect(onBlurFn).toHaveBeenCalled();
  //   });
  // });

  describe("#onFocus", () => {
    const onFocusFn = jest.fn();

    beforeAll(() => {
      monacoAdapter.on(EditorAdapterEvent.Focus, onFocusFn);
    });

    afterAll(() => {
      monacoAdapter.off(EditorAdapterEvent.Focus, onFocusFn);
    });

    it("should trigger `Focus` event when editor is in focus", () => {
      monacoEditor.focus();
      expect(onFocusFn).toHaveBeenCalled();
    });
  });

  describe("#onChange", () => {
    const onChangeFn = jest.fn();

    beforeAll(() => {
      monacoEditor.setValue("");
      monacoAdapter.on(EditorAdapterEvent.Change, onChangeFn);
    });

    afterEach(() => {
      onChangeFn.mockClear();
    });

    afterAll(() => {
      monacoAdapter.off(EditorAdapterEvent.Change, onChangeFn);
    });

    it("should trigger `Change` event when editor content changes", () => {
      monacoEditor.setValue("Hello");
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().insert("Hello"),
        inverse: new PlainTextOperation().delete("Hello"),
      });
    });

    it("should handle appending at the end of existing content", () => {
      const model = monacoEditor.getModel()!;
      model.applyEdits([
        {
          range: new monaco.Range(1, 6, 1, 6),
          text: " World",
        },
      ]);
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().retain(5).insert(" World"),
        inverse: new PlainTextOperation().retain(5).delete(" World"),
      });
    });

    it("should handle deleting at the end of existing content", () => {
      const model = monacoEditor.getModel()!;
      model.applyEdits([
        {
          range: new monaco.Range(1, 6, 1, 12),
          text: " Me",
        },
      ]);
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation()
          .retain(5)
          .delete(" World")
          .insert(" Me"),
        inverse: new PlainTextOperation()
          .retain(5)
          .delete(" Me")
          .insert(" World"),
      });
    });
  });

  describe("#onCursorActivity", () => {
    const onCursorActivity = jest.fn();

    beforeAll(() => {
      monacoAdapter.on(EditorAdapterEvent.Cursor, onCursorActivity);
    });

    afterAll(() => {
      monacoAdapter.off(EditorAdapterEvent.Cursor, onCursorActivity);
    });

    it("should trigger `Cursor` event when cursor is moved inside the editor", () => {
      monacoEditor.setPosition(new monaco.Position(2, 5));
      expect(onCursorActivity).toHaveBeenCalled();
    });
  });

  describe("#onModelChange", () => {
    const onChangeFn = jest.fn();

    beforeAll(() => {
      redoCallbackFn.mockClear();
      undoCallbackFn.mockClear();

      monacoEditor.setValue("");
      monacoAdapter.registerRedo(redoCallbackFn);
      monacoAdapter.registerUndo(undoCallbackFn);
      monacoAdapter.on(EditorAdapterEvent.Change, onChangeFn);
    });

    afterEach(() => {
      onChangeFn.mockClear();
      redoCallbackFn.mockClear();
      undoCallbackFn.mockClear();
    });

    afterAll(() => {
      monacoAdapter.deregisterRedo(redoCallbackFn);
      monacoAdapter.deregisterUndo(undoCallbackFn);
      monacoAdapter.off(EditorAdapterEvent.Change, onChangeFn);
    });

    it("should trigger `Change` event when content model changes", () => {
      monacoEditor.setModel(monaco.editor.createModel(text));
      expect(onChangeFn).toHaveBeenCalledWith({
        operation: new PlainTextOperation().insert(text),
        inverse: new PlainTextOperation().delete(text),
      });
    });

    it("should persist undo callback from earlier model", () => {
      monacoEditor.setModel(monaco.editor.createModel(""));
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.undo).toBe(undoCallbackFn);
    });

    it("should persist redo callback from earlier model", () => {
      monacoEditor.setModel(monaco.editor.createModel(""));
      const model = monacoEditor.getModel() as ITextModelWithUndoRedo;
      expect(model.redo).toBe(redoCallbackFn);
    });
  });
});
