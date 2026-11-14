import { Cursor, EditorAdapterEvent, IEditorAdapter } from "@otjs/plaintext-editor";
import { PlainTextOperation } from "@otjs/plaintext";
import Quill from "quill";

export class QuillAdapter implements IEditorAdapter {
  private _events = false;
  private _editor: Quill;
  private _handlers: Map<EditorAdapterEvent, Array<() => void>> = new Map();
  private _remoteCursors: Map<string, any> = new Map();

  constructor(options: { editor: Quill; bindEvents?: boolean }) {
    this._editor = options.editor;
    this.events = options.bindEvents ?? false;
  }

  get events(): boolean {
    return this._events;
  }

  set events(value: boolean) {
    if (typeof value !== "boolean") throw new TypeError("Events must be a boolean");
    if (this._events === value) return;
    this._events = value;
    if (value) this.bindEvents();
    else this.unbindEvents();
  }

  private bindEvents() {
    this._editor.on("text-change", (delta, oldDelta, source) => {
      if (source === "api") return;
      const op = new PlainTextOperation();
      const inv = new PlainTextOperation();

      delta.ops.forEach(change => {
        if (change.retain) op.retain(change.retain);
        if (change.delete) {
          op.delete(change.delete);
          // Approximation for inverse
          inv.retain(0).insert("");
        }
        if (change.insert) {
          const text = typeof change.insert === 'string' ? change.insert : JSON.stringify(change.insert);
          op.insert(text);
        }
      });
      this.emit(EditorAdapterEvent.Change, { operation: op, inverse: inv });
    });

    this._editor.on("selection-change", (range) => {
      if (range) this.emit(EditorAdapterEvent.Cursor);
    });
  }

  private unbindEvents() {
    this._editor.off("text-change");
    this._editor.off("selection-change");
  }

  on(event: EditorAdapterEvent, callback: any) {
    if (!this._handlers.has(event)) this._handlers.set(event, []);
    this._handlers.get(event)?.push(callback);
  }

  off(event: EditorAdapterEvent, callback: any) {
    const handlers = this._handlers.get(event);
    if (handlers) {
      this._handlers.set(event, handlers.filter(h => h !== callback));
    }
  }

  private emit(event: EditorAdapterEvent, data?: any) {
    this._handlers.get(event)?.forEach(h => h(data));
  }

  getCursor(): Cursor {
    const range = this._editor.getSelection();
    if (!range) return new Cursor(0, 0);
    return new Cursor(range.index, range.index + range.length);
  }

  setCursor(cursor: Cursor) {
    this._editor.setSelection(cursor.start, cursor.end - cursor.start, "silent");
  }

  getText(): string {
    return this._editor.getText();
  }

  setText(text: string) {
    this._editor.setText(text, "silent");
  }

  setInitiated() {
    this.setText("");
  }

  applyOperation(operation: PlainTextOperation) {
    const text = this.getText();
    // This is a simplified implementation. Quill uses Delta, so we translate PlainTextOperation.
    // In a real implementation, we'd iterate through the operation and use editor.update()
    let currentPos = 0;
    const changes = [];

    // Note: simplified for brevity, assumes Basic PlainTextOperation patterns
    this._editor.setText(operation.apply(text), "silent");
  }

  invertOperation(operation: PlainTextOperation): PlainTextOperation {
    const text = this.getText();
    const newText = operation.apply(text);
    // Simplification: normally you calculate the inverse of the op
    return new PlainTextOperation().retain(0).insert("");
  }

  setOtherCursor(params: { userColor: string; clientId: string; cursor: Cursor }) {
    // Quill doesn't have a built-in cursor marker like Ace,
    // would require custom CSS/DOM manipulation or Quill modules.
    return { dispose: () => {} };
  }

  registerUndo(callback: () => void) {
    (this._editor.history as any).undo = callback;
  }
  registerRedo(callback: () => void) {
    (this._editor.history as any).redo = callback;
  }
  deregisterUndo() {}
  deregisterRedo() {}

  dispose() {
    this.events = false;
    this._handlers.clear();
  }
}
