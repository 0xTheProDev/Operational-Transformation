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

// const TextOperation = firepad.TextOperation;
// const WrappedOperation = firepad.WrappedOperation;
// const Cursor = firepad.Cursor;

class RichTextCodeMirrorAdapter {
  constructor(rtcm) {
    this.rtcm = rtcm;
    this.cm = rtcm.codeMirror;

    bind(this, "onChange");
    bind(this, "onAttributesChange");
    bind(this, "onCursorActivity");
    bind(this, "onFocus");
    bind(this, "onBlur");

    this.rtcm.on("change", this.onChange);
    this.rtcm.on("attributesChange", this.onAttributesChange);
    this.cm.on("cursorActivity", this.onCursorActivity);
    this.cm.on("focus", this.onFocus);
    this.cm.on("blur", this.onBlur);
  }

  // Removes all event listeners from the CodeMirror instance.
  detach() {
    this.rtcm.off("change", this.onChange);
    this.rtcm.off("attributesChange", this.onAttributesChange);

    this.cm.off("cursorActivity", this.onCursorActivity);
    this.cm.off("focus", this.onFocus);
    this.cm.off("blur", this.onBlur);
  }

  registerCallbacks(cb) {
    this.callbacks = cb;
  }

  onChange(_, changes) {
    if (changes[0].origin !== "RTCMADAPTER") {
      const pair = RichTextCodeMirrorAdapter.operationFromCodeMirrorChanges(
        changes,
        this.cm,
      );
      this.trigger("change", pair[0], pair[1]);
    }
  }

  onAttributesChange(_, changes) {
    if (changes[0].origin !== "RTCMADAPTER") {
      const pair = RichTextCodeMirrorAdapter.operationFromAttributesChanges(
        changes,
        this.cm,
      );
      this.trigger("change", pair[0], pair[1]);
    }
  }

  onCursorActivity() {
    // We want to push cursor changes to Firebase AFTER edits to the history,
    // because the cursor coordinates will already be in post-change units.
    // Sleeping for 1ms ensures that sendCursor happens after sendOperation.
    const self = this;
    setTimeout(() => {
      self.trigger("cursorActivity");
    }, 1);
  }

  onFocus() {
    this.trigger("focus");
  }

  onBlur() {
    if (!this.cm.somethingSelected()) {
      this.trigger("blur");
    }
  }

  getValue() {
    return this.cm.getValue();
  }

  getCursor() {
    const cm = this.cm;
    const cursorPos = cm.getCursor();
    const position = cm.indexFromPos(cursorPos);
    let selectionEnd;
    if (cm.somethingSelected()) {
      const startPos = cm.getCursor(true);
      const selectionEndPos = posEq(cursorPos, startPos)
        ? cm.getCursor(false)
        : startPos;
      selectionEnd = cm.indexFromPos(selectionEndPos);
    } else {
      selectionEnd = position;
    }

    return new Cursor(position, selectionEnd);
  }

  setCursor({ position, selectionEnd }) {
    this.cm.setSelection(
      this.cm.posFromIndex(position),
      this.cm.posFromIndex(selectionEnd),
    );
  }

  addStyleRule(css) {
    if (typeof document === "undefined" || document === null) {
      return;
    }
    if (!this.addedStyleRules) {
      this.addedStyleRules = {};
      const styleElement = document.createElement("style");
      document.documentElement
        .getElementsByTagName("head")[0]
        .appendChild(styleElement);
      this.addedStyleSheet = styleElement.sheet;
    }
    if (this.addedStyleRules[css]) {
      return;
    }
    this.addedStyleRules[css] = true;
    return this.addedStyleSheet.insertRule(css, 0);
  }

  setOtherCursor(cursor, color, clientId) {
    const cursorPos = this.cm.posFromIndex(cursor.position);
    if (typeof color !== "string" || !color.match(/^#[a-fA-F0-9]{3,6}$/)) {
      return;
    }
    const end = this.rtcm.end();
    if (
      typeof cursor !== "object" ||
      typeof cursor.position !== "number" ||
      typeof cursor.selectionEnd !== "number"
    ) {
      return;
    }
    if (
      cursor.position < 0 ||
      cursor.position > end ||
      cursor.selectionEnd < 0 ||
      cursor.selectionEnd > end
    ) {
      return;
    }

    if (cursor.position === cursor.selectionEnd) {
      // show cursor
      const cursorCoords = this.cm.cursorCoords(cursorPos);
      const cursorEl = document.createElement("span");
      cursorEl.className = "other-client";
      cursorEl.style.borderLeftWidth = "2px";
      cursorEl.style.borderLeftStyle = "solid";
      cursorEl.style.borderLeftColor = color;
      cursorEl.style.marginLeft = cursorEl.style.marginRight = "-1px";
      cursorEl.style.height = `${
        (cursorCoords.bottom - cursorCoords.top) * 0.9
      }px`;
      cursorEl.setAttribute("data-clientid", clientId);
      cursorEl.style.zIndex = 0;

      return this.cm.setBookmark(cursorPos, {
        widget: cursorEl,
        insertLeft: true,
      });
    } else {
      // show selection
      const selectionClassName = `selection-${color.replace("#", "")}`;
      const transparency = 0.4;
      const rule =
        // fallback for browsers w/out rgba (rgb w/ transparency)
        // rule with alpha takes precedence if supported
        `.${selectionClassName} { background: ${hex2rgb(
          color,
        )};\n background: ${hex2rgb(color, transparency)};}`;
      this.addStyleRule(rule);

      let fromPos, toPos;
      if (cursor.selectionEnd > cursor.position) {
        fromPos = cursorPos;
        toPos = this.cm.posFromIndex(cursor.selectionEnd);
      } else {
        fromPos = this.cm.posFromIndex(cursor.selectionEnd);
        toPos = cursorPos;
      }
      return this.cm.markText(fromPos, toPos, {
        className: selectionClassName,
      });
    }
  }

  trigger(event) {
    const args = Array.prototype.slice.call(arguments, 1);
    const action = this.callbacks && this.callbacks[event];
    if (action) {
      action.apply(this, args);
    }
  }

  // Apply an operation to a CodeMirror instance.
  applyOperation(operation) {
    // HACK: If there are a lot of operations; hide CodeMirror so that it doesn't re-render constantly.
    if (operation.ops.length > 10)
      this.rtcm.codeMirror
        .getWrapperElement()
        .setAttribute("style", "display: none");

    const ops = operation.ops;
    let index = 0; // holds the current index into CodeMirror's content
    for (let i = 0, l = ops.length; i < l; i++) {
      const op = ops[i];
      if (op.isRetain()) {
        if (!emptyAttributes(op.attributes)) {
          this.rtcm.updateTextAttributes(
            index,
            index + op.chars,
            (attributes) => {
              for (const attr in op.attributes) {
                if (op.attributes[attr] === false) {
                  delete attributes[attr];
                } else {
                  attributes[attr] = op.attributes[attr];
                }
              }
            },
            "RTCMADAPTER",
            /*doLineAttributes=*/ true,
          );
        }
        index += op.chars;
      } else if (op.isInsert()) {
        this.rtcm.insertText(index, op.text, op.attributes, "RTCMADAPTER");
        index += op.text.length;
      } else if (op.isDelete()) {
        this.rtcm.removeText(index, index + op.chars, "RTCMADAPTER");
      }
    }

    if (operation.ops.length > 10) {
      this.rtcm.codeMirror.getWrapperElement().setAttribute("style", "");
      this.rtcm.codeMirror.refresh();
    }
  }

  registerUndo(undoFn) {
    this.cm.undo = undoFn;
  }

  registerRedo(redoFn) {
    this.cm.redo = redoFn;
  }

  invertOperation({ wrapped, meta }) {
    let pos = 0;
    const cm = this.rtcm.codeMirror;
    let spans;
    let i;
    const inverse = new TextOperation();
    for (let opIndex = 0; opIndex < wrapped.ops.length; opIndex++) {
      const op = wrapped.ops[opIndex];
      if (op.isRetain()) {
        if (emptyAttributes(op.attributes)) {
          inverse.retain(op.chars);
          pos += op.chars;
        } else {
          spans = this.rtcm.getAttributeSpans(pos, pos + op.chars);
          for (i = 0; i < spans.length; i++) {
            const inverseAttributes = {};
            for (const attr in op.attributes) {
              const opValue = op.attributes[attr];
              const curValue = spans[i].attributes[attr];

              if (opValue === false) {
                if (curValue) {
                  inverseAttributes[attr] = curValue;
                }
              } else if (opValue !== curValue) {
                inverseAttributes[attr] = curValue || false;
              }
            }

            inverse.retain(spans[i].length, inverseAttributes);
            pos += spans[i].length;
          }
        }
      } else if (op.isInsert()) {
        inverse["delete"](op.text.length);
      } else if (op.isDelete()) {
        const text = cm.getRange(
          cm.posFromIndex(pos),
          cm.posFromIndex(pos + op.chars),
        );

        spans = this.rtcm.getAttributeSpans(pos, pos + op.chars);
        let delTextPos = 0;
        for (i = 0; i < spans.length; i++) {
          inverse.insert(
            text.substr(delTextPos, spans[i].length),
            spans[i].attributes,
          );
          delTextPos += spans[i].length;
        }

        pos += op.chars;
      }
    }

    return new WrappedOperation(inverse, meta.invert());
  }
}

function cmpPos({ line, ch }, { line, ch }) {
  if (line < line) {
    return -1;
  }
  if (line > line) {
    return 1;
  }
  if (ch < ch) {
    return -1;
  }
  if (ch > ch) {
    return 1;
  }
  return 0;
}
function posEq(a, b) {
  return cmpPos(a, b) === 0;
}
function posLe(a, b) {
  return cmpPos(a, b) <= 0;
}

function codemirrorLength(cm) {
  const lastLine = cm.lineCount() - 1;
  return cm.indexFromPos({ line: lastLine, ch: cm.getLine(lastLine).length });
}

// Converts a CodeMirror change object into a TextOperation and its inverse
// and returns them as a two-element array.
RichTextCodeMirrorAdapter.operationFromCodeMirrorChanges = (changes, cm) => {
  // Approach: Replay the changes, beginning with the most recent one, and
  // construct the operation and its inverse. We have to convert the position
  // in the pre-change coordinate system to an index. We have a method to
  // convert a position in the coordinate system after all changes to an index,
  // namely CodeMirror's `indexFromPos` method. We can use the information of
  // a single change object to convert a post-change coordinate system to a
  // pre-change coordinate system. We can now proceed inductively to get a
  // pre-change coordinate system for all changes in the linked list.
  // A disadvantage of this approach is its complexity `O(n^2)` in the length
  // of the linked list of changes.

  let docEndLength = codemirrorLength(cm);
  let operation = new TextOperation().retain(docEndLength);
  let inverse = new TextOperation().retain(docEndLength);

  for (let i = changes.length - 1; i >= 0; i--) {
    const change = changes[i];
    const fromIndex = change.start;
    const restLength = docEndLength - fromIndex - change.text.length;

    operation = new TextOperation()
      .retain(fromIndex)
      ["delete"](change.removed.length)
      .insert(change.text, change.attributes)
      .retain(restLength)
      .compose(operation);

    inverse = inverse.compose(
      new TextOperation()
        .retain(fromIndex)
        ["delete"](change.text.length)
        .insert(change.removed, change.removedAttributes)
        .retain(restLength),
    );

    docEndLength += change.removed.length - change.text.length;
  }

  return [operation, inverse];
};

// Converts an attributes changed object to an operation and its inverse.
RichTextCodeMirrorAdapter.operationFromAttributesChanges = (changes, cm) => {
  const docEndLength = codemirrorLength(cm);

  const operation = new TextOperation(),
    inverse = new TextOperation();
  let pos = 0;

  for (let i = 0; i < changes.length; i++) {
    const change = changes[i];
    const toRetain = change.start - pos;
    assert(toRetain >= 0); // changes should be in order and non-overlapping.
    operation.retain(toRetain);
    inverse.retain(toRetain);

    const length = change.end - change.start;
    operation.retain(length, change.attributes);
    inverse.retain(length, change.attributesInverse);
    pos = change.start + length;
  }

  operation.retain(docEndLength - pos);
  inverse.retain(docEndLength - pos);

  return [operation, inverse];
};

// Throws an error if the first argument is falsy. Useful for debugging.
function assert(b, msg) {
  if (!b) {
    throw new Error(msg || "assertion error");
  }
}

// Bind a method to an object, so it doesn't matter whether you call
// object.method() directly or pass object.method as a reference to another
// function.
function bind(obj, method) {
  const fn = obj[method];
  obj[method] = function (...args) {
    fn.apply(obj, args);
  };
}

function emptyAttributes(attrs) {
  for (const attr in attrs) {
    return false;
  }
  return true;
}

function hex2rgb(hex, transparency) {
  if (typeof hex !== "string") {
    throw new TypeError("Expected a string");
  }
  hex = hex.replace(/^#/, "");
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  const num = parseInt(hex, 16);
  const rgb = [num >> 16, (num >> 8) & 255, num & 255];
  let type = "rgb";
  if (exists(transparency)) {
    type = "rgba";
    rgb.push(transparency);
  }
  // rgb(r, g, b) or rgba(r, g, b, t)
  return `${type}(${rgb.join(",")})`;
}

function exists(val) {
  return val !== null && val !== undefined;
}
