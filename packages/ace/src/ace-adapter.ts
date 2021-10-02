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
  ICursor,
  IDisposable,
  IEditorAdapter,
  TEditorAdapterCursorParams,
  TEditorAdapterEventArgs,
} from "@otjs/plaintext-editor";
import {
  IPlainTextOperation,
  ITextOperation,
  PlainTextOperation,
} from "@otjs/plaintext";
import {
  addStyleRule,
  assert,
  Disposable,
  EndOfLineSequence,
} from "@otjs/utils";
import mitt, { Emitter, Handler } from "mitt";
import { TAceAdapterConstructionOptions } from "./api";

/**
 * Range Constructor for Ace Editor
 */
const Range: typeof AceAjax.Range = ace.require("ace/range").Range;

/**
 * @public
 * Create Editor Adapter for Plain Text Editor using Ace as Editor.
 * @param constructorOptions - A Configuration Object consisting Ace Editor Instance.
 */
export class AceAdapter implements IEditorAdapter {
  protected _ace: AceAjax.Editor;
  protected readonly _aceDocument: AceAjax.Document;
  protected readonly _aceSession: AceAjax.IEditSession;
  protected _bindEvents: boolean;
  protected _initiated: boolean = false;
  protected _ignoreChanges: boolean = false;
  protected _undoCallback: Handler<void> | null = null;
  protected _redoCallback: Handler<void> | null = null;
  protected _originalUndo: Handler<void> | null = null;
  protected _originalRedo: Handler<void> | null = null;
  protected _lastDocLines: string[] = [];
  protected _lastCursorRange: AceAjax.Range | null = null;
  protected _emitter: Emitter<TEditorAdapterEventArgs> = mitt();

  constructor({ editor, bindEvents = false }: TAceAdapterConstructionOptions) {
    this._ace = editor;
    this._aceSession = this._ace.getSession();
    this._aceDocument = this._aceSession.getDocument();
    this._bindEvents = bindEvents;

    this._grabDocumentState();
    this._init();
  }

  get events(): boolean {
    return this._bindEvents;
  }

  set events(bindEvents: boolean) {
    assert(
      typeof bindEvents === "boolean",
      "events property takes only boolean value"
    );

    if (this._bindEvents === bindEvents) {
      return;
    }

    if (bindEvents === true) {
      this._bindEvents = true;
      this._init();
      return;
    }

    this._teardown();
  }

  /** Bind event handlers to Ace instance */
  protected _init(): void {
    /* istanbul ignore if */
    if (this._bindEvents === false) {
      return;
    }

    this._ace.on("blur", this._onBlur);
    this._ace.on("focus", this._onFocus);
    this._ace.on("change", this._onChange);
    this._aceSession.selection.on("changeCursor", this._onCursorActivity);
  }

  /** Dispose event handlers to Ace instance */
  protected _teardown(): void {
    /* istanbul ignore if */
    if (this._bindEvents === false) {
      return;
    }

    this._ace.off("blur", this._onBlur);
    this._ace.off("focus", this._onFocus);
    this._ace.off("change", this._onChange);
    this._aceSession.selection.off("changeCursor", this._onCursorActivity);

    this._bindEvents = false;
  }

  on<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener: Handler<TEditorAdapterEventArgs[Key]>
  ): void {
    return this._emitter?.on(event, listener);
  }

  off<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener?: Handler<TEditorAdapterEventArgs[Key]>
  ): void {
    return this._emitter?.off(event, listener);
  }

  /** Trigger an event with optional payload */
  protected _trigger<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    payload: TEditorAdapterEventArgs[Key]
  ): void {
    return this._emitter!.emit(event, payload);
  }

  registerUndo(undoCallback: Handler<void>): void {
    this._originalUndo = this._ace.undo;
    this._ace.undo = this._undoCallback = undoCallback;
  }

  registerRedo(redoCallback: Handler<void>): void {
    this._originalRedo = this._ace.redo;
    this._ace.redo = this._redoCallback = redoCallback;
  }

  deregisterUndo(undoCallback?: Handler<void>): void {
    if (undoCallback != null && this._undoCallback !== undoCallback) {
      return;
    }

    /* istanbul ignore else */
    if (this._ace.undo !== this._originalUndo) {
      this._ace.undo = this._originalUndo!;
    }

    this._originalUndo = null;
  }

  deregisterRedo(redoCallback?: Handler<void>): void {
    if (redoCallback != null && this._redoCallback !== redoCallback) {
      return;
    }

    /* istanbul ignore else */
    if (this._ace.redo !== this._originalRedo) {
      this._ace.redo = this._originalRedo!;
    }

    this._originalRedo = null;
  }

  getCursor(): ICursor | null {
    let start: number, end: number;

    try {
      start = this._aceDocument.positionToIndex(
        this._aceSession.selection.getRange().start
      );
      end = this._aceDocument.positionToIndex(
        this._aceSession.selection.getRange().end
      );
    } catch (err) {
      console.log("Failed to get cursor position from Ace editor: ", err);

      try {
        // If the new range doesn't work (sometimes with setValue), we'll use the old range
        start = this._aceDocument.positionToIndex(this._lastCursorRange!.start);
        end = this._aceDocument.positionToIndex(this._lastCursorRange!.end);
      } catch (err2) {
        console.log(
          "Couldn't figure out the cursor range:",
          err2,
          "-- setting it to 0:0."
        );

        return null;
      }
    }

    if (start > end) {
      [start, end] = [end, start];
    }

    return new Cursor(start, end);
  }

  setCursor(cursor: ICursor): void {
    const { position, selectionEnd } = cursor.toJSON();

    let start = this._aceDocument.indexToPosition(position, 0);
    let end = this._aceDocument.indexToPosition(selectionEnd, 0);

    /** If selection is inversed */
    if (position > selectionEnd) {
      [start, end] = [end, start];
    }

    /** Create Selection in the Editor */
    this._aceSession.selection.setSelectionRange(
      new Range(start.row, start.column, end.row, end.column)
    );
  }

  setOtherCursor({
    clientId,
    cursor,
    userColor: cursorColor,
  }: TEditorAdapterCursorParams): IDisposable {
    assert(
      typeof cursor === "object" && typeof cursor.toJSON === "function",
      "Cursor must be an implementation of ICursor"
    );

    assert(
      typeof clientId === "string" && typeof cursorColor === "string",
      "Client Id and User Color must be strings."
    );

    /** Remove non-alphanumeric characters to create valid classname */
    const cursorColorTitle = cursorColor.replace(/\W+/g, "_");
    const className = `remote-client-${cursorColorTitle}`;

    /** Generate Style rules and add them to document */
    addStyleRule({
      className,
      cursorColor,
    });

    /** Extract Positions */
    const { position, selectionEnd } = cursor.toJSON();

    /** Get co-ordinate position in Editor */
    let start = this._aceDocument.indexToPosition(position, 0);
    let end = this._aceDocument.indexToPosition(selectionEnd, 0);

    /** Find Range of Selection */
    const cursorRange = new Range(start.row, start.column, end.row, end.column);

    let originalClipRows = cursorRange.clipRows;
    cursorRange.clipRows = function (
      firstRow: number,
      lastRow: number
    ): AceAjax.Range {
      const range = originalClipRows.call(cursorRange, firstRow, lastRow);
      range.isEmpty = function () {
        return false;
      };
      return range;
    };

    // @ts-expect-error
    cursorRange.start = this._aceDocument.createAnchor(
      cursorRange.start.row,
      cursorRange.start.column
    );

    // @ts-expect-error
    cursorRange.end = this._aceDocument.createAnchor(
      cursorRange.end.row,
      cursorRange.end.column
    );

    // @ts-expect-error
    cursorRange.id = this._aceSession.addMarker(
      cursorRange,
      className,
      "text",
      false
    );

    return Disposable.create(() => {
      // @ts-expect-error
      cursorRange.start.detach();
      // @ts-expect-error
      cursorRange.end.detach();
      // @ts-expect-error
      this._aceSession.removeMarker(cursorRange.id);
    });
  }

  getText(): string {
    return this._aceDocument.getValue();
  }

  setText(text: string): void {
    this._aceDocument.setValue(text);
  }

  setInitiated(): void {
    this.setText("");
    this._initiated = true;
  }

  applyOperation(operation: IPlainTextOperation): void {
    if (operation.isNoop()) {
      return;
    }

    this._ignoreChanges = true;
    this._applyOperationToACE(operation.entries());
    this._ignoreChanges = false;
  }

  invertOperation(operation: IPlainTextOperation): IPlainTextOperation {
    return operation.invert(this.getText());
  }

  dispose(): void {
    this._teardown();
    this.deregisterRedo();
    this.deregisterUndo();

    /* istanbul ignore else */
    if (this._emitter) {
      this._emitter.all.clear();
      // @ts-expect-error
      this._emitter = null;
    }

    // @ts-expect-error
    this._ace = null;
    // @ts-expect-error
    this._aceDocument = null;
    // @ts-expect-error
    this._aceSession = null;
    this._initiated = false;
  }

  /**
   * Update Content String Array and Cursor Positions.
   */
  protected _grabDocumentState(): void {
    this._lastDocLines = this._aceDocument.getAllLines();
    this._lastCursorRange = this._aceSession.selection.getRange();
  }

  /**
   * Handles `Blur` event in Ace editor.
   */
  protected _onBlur = (): void => {
    if (!this._ace.selection.isEmpty()) {
      return;
    }

    this._trigger(EditorAdapterEvent.Blur, undefined);
  };

  /**
   * Handles `Focus` event in Ace editor.
   */
  protected _onFocus = (): void => {
    this._trigger(EditorAdapterEvent.Focus, undefined);
  };

  /**
   * Handles `Change` event in Ace editor.
   */
  protected _onChange = (change: AceAjax.EditorChangeEvent): void => {
    /** Ignore if change is being applied by itself. */
    if (this._ignoreChanges || !this._initiated) {
      return;
    }

    const [operation, inverse] = this._operationFromACEChange(change);
    this._trigger(EditorAdapterEvent.Change, {
      operation,
      inverse,
    });

    this._grabDocumentState();
  };

  /**
   * Handles `CursorChange` event in Ace editor.
   */
  protected _onCursorActivity = (): void => {
    this._trigger(EditorAdapterEvent.Cursor, undefined);
  };

  /**
   * Transform Ace Content changes into pair of Text Operation that are inverse of each other.
   * @param changes - Set of Changes from Ace Editor Change Event.
   */
  protected _operationFromACEChange(
    change: AceAjax.EditorChangeEvent
  ): [operation: IPlainTextOperation, inverse: IPlainTextOperation] {
    const { action, lines, start: startPosition } = change;

    const eol = this._aceDocument.getNewLineCharacter() ?? EndOfLineSequence.LF;
    const text = lines.join(eol);
    const start = this._aceDocument.positionToIndex(startPosition);

    let restLength = this._lastDocLines.join(eol).length - start;

    if (action === "remove") {
      restLength -= text.length;
    }

    const insertOperation = new PlainTextOperation()
      .retain(start)
      .insert(text)
      .retain(restLength);

    const deleteOperation = new PlainTextOperation()
      .retain(start)
      .delete(text)
      .retain(restLength);

    if (action === "remove") {
      return [deleteOperation, insertOperation];
    }

    return [insertOperation, deleteOperation];
  }

  /**
   * Transforms Individual Text Operations into Insert/Delete Operations for Ace.
   * @param ops - List of Individual Text Operations.
   */
  protected _applyOperationToACE(
    ops: IterableIterator<[index: number, operation: ITextOperation]>
  ) {
    let index = 0;
    let opValue: IteratorResult<[index: number, operation: ITextOperation]>;

    while (!(opValue = ops.next()).done) {
      const [, op] = opValue.value;

      switch (true) {
        case op.isRetain():
          /** Retain Operation */
          index += op.characterCount();
          break;

        case op.isInsert():
          /** Insert Operation */
          this._aceDocument.insert(
            this._aceDocument.indexToPosition(index, 0),
            op.textContent()
          );
          index += op.textContent()!.length;
          break;

        case op.isDelete(): {
          /** Delete Operation */
          const start = this._aceDocument.indexToPosition(index, 0);
          const end = this._aceDocument.indexToPosition(
            index + op.characterCount(),
            0
          );
          const range = Range.fromPoints(start, end);
          this._aceDocument.remove(range);
        }
      }
    }

    this._grabDocumentState();
  }
}
