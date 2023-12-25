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

import * as quill from "quill";
import mitt, { Emitter, Handler } from "mitt";
import {
  IPlainTextOperation,
  ITextOperation,
  PlainTextOperation,
  TTextOperationAttributes,
} from "@otjs/plaintext";
import {
  Cursor,
  EditorAdapterEvent,
  ICursor,
  IEditorAdapter,
  TCursor,
  TEditorAdapterCursorParams,
  TEditorAdapterEventArgs,
} from "@otjs/plaintext-editor";
import { IDisposable, IDisposableCollection } from "@otjs/types";
import {
  addStyleRule,
  assert,
  Disposable,
  DisposableCollection,
  EndOfLineSequence,
} from "@otjs/utils";
import { TQuillAdapterConstructionOptions } from "./api";
import { createCursorWidget, disposeCursorWidgets } from "./cursor-widget.impl";
import { ITextModelWithUndoRedo } from "./text-model";

/** Type Definition for Quill Delta */
type TextChangeHandlerParamters = Parameters<quill.TextChangeHandler>;
type Delta = TextChangeHandlerParamters[0];

/**
 * @public
 * Create Editor Adapter for Rich Text Editor using Quill as Editor.
 * @param constructorOptions - A Configuration Object consisting Quill Editor Instance.
 */
export class QuillAdapter implements IEditorAdapter {
  protected readonly _toDispose: IDisposableCollection =
    new DisposableCollection();

  protected _announcementDuration: number;
  protected _bindEvents: boolean;
  protected _initiated: boolean = false;
  protected _ignoreChanges: boolean = false;
  protected _undoCallback: Handler<void> | null = null;
  protected _redoCallback: Handler<void> | null = null;
  protected _originalUndo: Handler<void> | null = null;
  protected _originalRedo: Handler<void> | null = null;
  protected _lastDocLines: string[] = [];
  protected _lastCursorRange: quill.RangeStatic | null = null;
  protected _quill: quill.Quill;
  protected _emitter: Emitter<TEditorAdapterEventArgs> = mitt();

  constructor({
    editor,
    announcementDuration = 1000,
    bindEvents = false,
  }: TQuillAdapterConstructionOptions) {
    this._quill = editor;
    this._announcementDuration = announcementDuration;
    this._bindEvents = bindEvents;

    this._init();
    this._toDispose.push(disposeCursorWidgets());
  }

  get events(): boolean {
    return this._bindEvents;
  }

  set events(bindEvents: boolean) {
    assert(
      typeof bindEvents === "boolean",
      "events property takes only boolean value",
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

  /** Bind event handlers to Monaco instance */
  protected _init(): void {
    /* istanbul ignore if */
    if (this._bindEvents === false) {
      return;
    }

    this._quill.on("text-change", this._onChange);
    this._quill.on("selection-change", this._onCursorActivity);

    this._toDispose.push(
      // this._quill.onDidBlurEditorWidget(() => {
      //   this._onBlur();
      // }),
      // this._quill.onDidFocusEditorWidget(() => {
      //   this._onFocus();
      // }),
      // this._quill.onDidChangeModel((ev: monaco.editor.IModelChangedEvent) => {
      //   this._onModelChange(ev);
      // }),
      Disposable.create(() => this._quill.off("text-change", this._onChange)),
      Disposable.create(() =>
        this._quill.off("selection-change", this._onCursorActivity),
      ),
    );
  }

  /** Dispose event handlers to Monaco instance */
  protected _teardown(): void {
    /* istanbul ignore if */
    if (this._bindEvents === false) {
      return;
    }

    this._toDispose.dispose();
    this._bindEvents = false;
  }

  on<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener: Handler<TEditorAdapterEventArgs[Key]>,
  ): void {
    return this._emitter?.on(event, listener);
  }

  off<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    listener?: Handler<TEditorAdapterEventArgs[Key]>,
  ): void {
    return this._emitter?.off(event, listener);
  }

  /** Trigger an event with optional payload */
  protected _trigger<Key extends keyof TEditorAdapterEventArgs>(
    event: Key,
    payload: TEditorAdapterEventArgs[Key],
  ): void {
    return this._emitter!.emit(event, payload);
  }

  registerUndo(undoCallback: Handler<void>): void {
    const history = this._quill.history;
    this._originalUndo = history.undo;
    history.undo = this._undoCallback = undoCallback;
  }

  registerRedo(redoCallback: Handler<void>): void {
    const history = this._quill.history;
    this._originalRedo = history.redo;
    history.redo = this._redoCallback = redoCallback;
  }

  deregisterUndo(undoCallback?: Handler<void>): void {
    if (undoCallback != null && this._undoCallback !== undoCallback) {
      return;
    }

    const history = this._quill.history;

    /* istanbul ignore else */
    if (this._originalUndo != null && history.undo !== this._originalUndo) {
      history.undo = this._originalUndo;
    }

    this._originalUndo = null;
  }

  deregisterRedo(redoCallback?: Handler<void>): void {
    if (redoCallback != null && this._redoCallback !== redoCallback) {
      return;
    }

    const history = this._quill.history;

    /* istanbul ignore else */
    if (this._originalRedo != null && history.redo !== this._originalRedo) {
      history.redo = this._originalRedo;
    }

    this._originalRedo = null;
  }

  getCursor(): ICursor | null {
    /** Fallback to last cursor change */
    let selection = this._quill.getSelection() ?? this._lastCursorRange;

    /* istanbul ignore if */
    if (selection == null) {
      return null;
    }

    /** Obtain selection indexes */
    const start = selection.index;
    const end = selection.index + selection.length;

    /** Return cursor position */
    return new Cursor(start, end);
  }

  setCursor(cursor: ICursor): void {
    const { position, selectionEnd } = cursor.toJSON();

    /** Calculate the length of the selection */
    const length = selectionEnd - position;

    /** Create Selection in the Editor */
    this._quill.setSelection(position, length);
  }

  setOtherCursor({
    clientId,
    cursor,
    userName,
    userColor: cursorColor,
  }: TEditorAdapterCursorParams): IDisposable {
    assert(
      typeof cursor === "object" && typeof cursor.toJSON === "function",
      "Cursor must be an implementation of ICursor",
    );

    assert(
      typeof clientId === "string" &&
        typeof cursorColor === "string" &&
        (userName == null || typeof userName === "string"),
      "Client Id, User Name and User Color must be strings.",
    );

    /** Remove non-alphanumeric characters to create valid classname */
    const cursorColorTitle = cursorColor.replace(/,/g, "_").replace(/\W+/g, "");
    const className = `remote-client-${cursorColorTitle}`;

    /** Generate Style rules and add them to document */
    addStyleRule({
      className,
      cursorColor,
    });

    /** Extract Positions */
    const { position, selectionEnd } = cursor.toJSON();

    /** Get co-ordinate position in Editor */
    const start = this._getPositionAt(position);
    const end = this._getPositionAt(selectionEnd);

    /** Find DOM Leaves on Selection */
    const [startLeaf, endLeaf] = [
      this._quill.getLeaf(start),
      this._quill.getLeaf(end),
    ];

    /** Add decoration to the Editor */
    const decorationClassName =
      start === end ? `${className}-cursor` : `${className}-selection`;
    const decorations = this._monaco.deltaDecorations(
      [],
      [
        {
          range,
          options: {
            className: decorationClassName,
            isWholeLine: false,
            stickiness:
              monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
          },
        },
      ],
    );

    /** Add Cursor Widget to the editor */
    createCursorWidget({
      className,
      clientId,
      range,
      userName,
      duration: this._announcementDuration,
      editor: this._monaco,
    });

    return Disposable.create(() => {
      /* istanbul ignore if */
      if (!this._monaco) {
        return;
      }

      this._monaco.deltaDecorations(decorations, []);
    });
  }

  getText(): string {
    return this._quill.getText().trim();
  }

  setText(text: string): void {
    this._quill.setText(text, "silent");
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

    /** Get Changes List */
    const model = this._getModel();

    /* istanbul ignore if */
    if (!model) {
      return;
    }

    const changes: monaco.editor.IIdentifiedSingleEditOperation[] =
      this._transformOpsIntoQuillChanges(operation.entries(), model);

    /* istanbul ignore else */
    if (changes.length) {
      /** Changes exists to be applied */
      this._applyChangesToQuill(changes);
    }

    /* istanbul ignore else */
    if (model) {
      /** Update Editor Content and Reset Config */
      this._lastDocLines = model.getLinesContent();
    }

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
    this._quill = null;
    this._initiated = false;
  }

  /**
   * Returns Text Model associated with editor instance.
   */
  // protected _getModel(): ITextModelWithUndoRedo | void {
  //   /* istanbul ignore if */
  //   if (!this._quill) {
  //     return;
  //   }

  //   return this._quill as ITextModelWithUndoRedo;
  // }

  /**
   * Apply Edit Operations onto Monaco Model.
   * @param changes - Set of Monaco Model Content Changes.
   */
  protected _applyEdits(
    changes: monaco.editor.IIdentifiedSingleEditOperation[],
  ): void {
    const model = this._getModel();

    /* istanbul ignore if */
    if (!model) {
      return;
    }

    model.applyEdits(changes);
  }

  /**
   * Handles `Blur` event in Monaco editor.
   */
  protected _onBlur(): void {
    const currentSelecton = this._quill.getSelection();

    if (!currentSelecton) {
      this._trigger(EditorAdapterEvent.Blur, undefined);
    }
  }

  /**
   * Handles `Focus` event in Monaco editor.
   */
  protected _onFocus(): void {
    this._trigger(EditorAdapterEvent.Focus, undefined);
  }

  /**
   * Handles `ModelChange` event in Monaco editor.
   */
  // protected _onModelChange(_ev: monaco.editor.IModelChangedEvent): void {
  //   const newModel = this._getModel();

  //   /* istanbul ignore if */
  //   if (!newModel) {
  //     return;
  //   }

  //   /* istanbul ignore else */
  //   if (this._undoCallback) {
  //     this._originalUndo = newModel.undo;
  //     newModel.undo = this._undoCallback;
  //   }

  //   /* istanbul ignore else */
  //   if (this._redoCallback) {
  //     this._originalRedo = newModel.redo;
  //     newModel.redo = this._redoCallback;
  //   }

  //   const oldLinesCount = this._lastDocLines.length;
  //   const oldLastColumLength = this._lastDocLines[oldLinesCount - 1].length;
  //   const oldRange = new monaco.Range(
  //     1,
  //     1,
  //     oldLinesCount,
  //     oldLastColumLength + 1,
  //   );
  //   const oldValue = this._getPreviousContentInRange();

  //   this._onChange({
  //     changes: [
  //       {
  //         range: oldRange,
  //         rangeOffset: 0,
  //         rangeLength: oldValue.length,
  //         text: newModel.getValue(),
  //       },
  //     ],
  //   });
  // }

  /**
   * Handles `text-change` event in Quill editor.
   */
  protected _onChange(
    delta: Delta,
    oldContents: Delta,
    source: quill.Sources,
  ): void {
    /** Ignore if change is being applied by itself. */
    if (this._ignoreChanges || !this._initiated) {
      return;
    }

    const content = this._getPreviousContentInRange();
    const contentLength = content.length;

    /* istanbul ignore if */
    if (delta.length() === 0) {
      /** If no change information received */
      const op = new PlainTextOperation().retain(contentLength);
      this._trigger(EditorAdapterEvent.Change, {
        operation: op,
        inverse: op,
      });
      return;
    }

    const [operation, inverse] = this._operationFromQuillChange(
      delta,
      contentLength,
    );

    /** Cache current content to use during next change trigger */
    // this._lastDocLines = model.getLinesContent();

    this._trigger(EditorAdapterEvent.Change, {
      operation,
      inverse,
    });
  }

  /**
   * Handles `selection-change` event in Quill editor.
   */
  protected _onCursorActivity(): // range: quill.RangeStatic, oldRange: quill.RangeStatic, source: quill.Sources
  void {
    /** Ignore if the change is done by Third-party Widgets */
    // if (source === 'silent') {
    //   return;
    // }

    this._trigger(EditorAdapterEvent.Cursor, undefined);
  }

  protected _getPositionAt(index: number): number {
    const contentLength = this._quill.getLength();
    const maxIndex = contentLength ? contentLength - 1 : 0;

    index = index < 0 ? 0 : index;
    index = index > maxIndex ? maxIndex : index;

    return index;
  }

  protected _isValidLeaf(leaf: any): boolean {
    return leaf && leaf[0] && leaf[0].domNode && leaf[1] >= 0;
  }

  /**
   * Returns content from editor model for given range or whole content.
   * @param range - Range of the editor to pick content from (optional).
   */
  protected _getPreviousContentInRange(range?: quill.RangeStatic): string {
    const model = this._getModel();
    const eol = model ? model.getEOL() : EndOfLineSequence.LF;

    if (!range) {
      return this._lastDocLines.join(eol);
    }

    let val: string = "";

    const { startLineNumber, startColumn, endLineNumber, endColumn } = range;

    for (let i = startLineNumber; i <= endLineNumber; i++) {
      const line = this._lastDocLines[i - 1];

      if (i === startLineNumber) {
        if (i === endLineNumber) {
          return line.slice(startColumn - 1, endColumn - 1);
        }

        val += line.slice(startColumn - 1) + eol;
      } else if (i === endLineNumber) {
        val += line.slice(0, endColumn - 1);
      } else {
        val += line + eol;
      }
    }

    return val;
  }

  /**
   * Transform Quill Content changes into pair of Text Operation that are inverse of each other.
   * @param delta - Delta of Changes from Quill Text Change Event.
   * @param contentLength - Current Size of the Content string.
   */
  protected _operationFromQuillChange(
    delta: Delta,
    contentLength: number,
  ): [operation: IPlainTextOperation, inverse: IPlainTextOperation] {
    /** Text Operation respective of current changes */
    let mainOp: IPlainTextOperation = new PlainTextOperation();

    /** Text Operation respective of invert changes */
    let reverseOp: IPlainTextOperation = new PlainTextOperation();

    let cursor = 0;

    delta.forEach((op) => {
      if (op.insert != null) {
        if (typeof op.insert !== "string") {
          return;
        }

        mainOp = mainOp.insert(
          op.insert,
          op.attributes as unknown as TTextOperationAttributes,
        );
        reverseOp = reverseOp.delete(op.insert);
      } else if (op.delete != null) {
        mainOp = mainOp.delete(op.delete);
        reverseOp = reverseOp.insert(
          this._getPreviousContentInRange(op.delete),
        );
        cursor += op.delete;
      } else {
        if (typeof op.retain !== "number") {
          return;
        }

        mainOp = mainOp.retain(op.retain);
        reverseOp = reverseOp.retain(op.retain);
        cursor += op.retain;
      }
    });

    /**
     * ops: [
        { retain: 3 },
        { attributes: { bold: true }, retain: 1 }
     ]

      ops: [
        { retain: 4 },
        { attributes: { header: 2 }, retain: 1}
      ]
     */

    // for (const change of changes) {
    //   const { range, text, rangeOffset, rangeLength } = <
    //     Omit<monaco.editor.IModelContentChange, "range"> & {
    //       range: monaco.Range;
    //     }
    //   >change;
    //   const retain = rangeOffset - skippedChars;

    //   try {
    //     mainOp = mainOp.retain(retain);
    //     reverseOp = reverseOp.retain(retain);
    //   } catch (err) /* istanbul ignore next */ {
    //     this._trigger(EditorAdapterEvent.Error, {
    //       err: err as Error,
    //       operation: mainOp.toString(),
    //       retain,
    //     });
    //     throw err;
    //   }

    //   if (!text && !range.isEmpty()) {
    //     mainOp = mainOp.delete(rangeLength);
    //     reverseOp = reverseOp.insert(this._getPreviousContentInRange(range));
    //   } else if (text && !range.isEmpty()) {
    //     mainOp = mainOp.delete(rangeLength).insert(text);
    //     reverseOp = reverseOp
    //       .insert(this._getPreviousContentInRange(range))
    //       .delete(text);
    //   } else {
    //     mainOp = mainOp.insert(text);
    //     reverseOp = reverseOp.delete(text);
    //   }

    //   skippedChars = skippedChars + retain + rangeLength;
    // }

    try {
      mainOp = mainOp.retain(contentLength - cursor);
      reverseOp = reverseOp.retain(contentLength - cursor);
    } catch (err) /* istanbul ignore next */ {
      this._trigger(EditorAdapterEvent.Error, {
        err: err as Error,
        operation: mainOp.toString(),
        skippedChars: cursor,
        contentLength,
      });
      throw err;
    }
    return [mainOp, reverseOp];
  }

  /**
   * Transforms Individual Text Operations into Edit Operations for Quill.
   * @param ops - List of Individual Text Operations.
   * @param model - Quill Text Model.
   */
  protected _transformOpsIntoQuillChanges(
    ops: IterableIterator<[index: number, operation: ITextOperation]>,
    model: monaco.editor.ITextModel,
  ): monaco.editor.IIdentifiedSingleEditOperation[] {
    let index = 0;
    const changes: monaco.editor.IIdentifiedSingleEditOperation[] = [];
    let opValue: IteratorResult<[index: number, operation: ITextOperation]>;

    while (!(opValue = ops.next()).done) {
      const [, op] = opValue.value;

      switch (true) {
        case op.isRetain():
          /** Retain Operation */
          index += op.characterCount();
          break;

        case op.isInsert(): {
          /** Insert Operation */
          const pos = model.getPositionAt(index);
          changes.push({
            range: new monaco.Range(
              pos.lineNumber,
              pos.column,
              pos.lineNumber,
              pos.column,
            ),
            text: op.textContent(),
            forceMoveMarkers: true,
          });
          break;
        }

        case op.isDelete(): {
          /** Delete Operation */
          const from = model.getPositionAt(index);
          const to = model.getPositionAt(index + op.characterCount());

          changes.push({
            range: new monaco.Range(
              from.lineNumber,
              from.column,
              to.lineNumber,
              to.column,
            ),
            text: "",
            forceMoveMarkers: true,
          });

          index += op.characterCount();
        }
      }
    }

    return changes;
  }

  /**
   * Applies Edit Operations into Quill editor model.
   * @param changes - List of Edit Operations.
   */
  protected _applyChangesToQuill(
    changes: monaco.editor.IIdentifiedSingleEditOperation[],
  ): void {
    const readOnly = this._monaco.getOption(
      monaco.editor.EditorOption.readOnly,
    );

    if (readOnly) {
      this._monaco.updateOptions({ readOnly: false });
    }

    this._applyEdits(changes);

    if (readOnly) {
      this._monaco.updateOptions({ readOnly });
    }
  }
}

export { IDisposable, IDisposableCollection } from "@otjs/types";
