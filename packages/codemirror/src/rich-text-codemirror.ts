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

import { Editor as CodeMirror, EditorChange, Position } from "codemirror";
import { AnnotationList } from "./annotation-list";
import { LineAttributes, TextAttributes } from "./attributes";
import { EntityManager } from "./entity-manager";
// const AnnotationList = firepad.AnnotationList;
// const Span = firepad.Span;
// const utils = firepad.utils;
// const ATTR = firepad.AttributeConstants;
import { Span } from "./span";

const RichTextClassPrefixDefault = "cmrt-";
const RichTextOriginPrefix = "cmrt-";

// These attributes will have styles generated dynamically in the page.
const DynamicStyleAttributes = {
  c: "color",
  bc: "background-color",
  fs: "font-size",
  li: function (indent: number): `padding-left: ${number}px` {
    return `padding-left: ${indent * 40}px`;
  },
};

// A cache of dynamically-created styles so we can re-use them.
const StyleCache_ = {};

export type RichTextChange = {
  start: number;
  end: number;
  removed: string;
  removedAttributes: Object;
  attributes: Object;
  text: string;
  origin: string | undefined;
};

export class RichTextCodeMirror {
  codeMirror: CodeMirror;
  annotationList_: AnnotationList;

  constructor(
    codeMirror: CodeMirror,
    entityManager: EntityManager,
    options: Object,
  ) {
    this.codeMirror = codeMirror;
    this.options_ = options || {};
    this.entityManager_ = entityManager;
    this.currentAttributes_ = null;

    const self = this;
    this.annotationList_ = new AnnotationList((oldNodes, newNodes) => {
      self.onAnnotationsChanged_(oldNodes, newNodes);
    });

    // Ensure annotationList is in sync with any existing codemirror contents.
    this.initAnnotationList_();

    bind(this, "onCodeMirrorBeforeChange_");
    bind(this, "onCodeMirrorChange_");
    bind(this, "onCursorActivity_");

    if (parseInt(CodeMirror.version) >= 4) {
      this.codeMirror.on("changes", this.onCodeMirrorChange_);
    } else {
      this.codeMirror.on("change", this.onCodeMirrorChange_);
    }
    this.codeMirror.on("beforeChange", this.onCodeMirrorBeforeChange_);
    this.codeMirror.on("cursorActivity", this.onCursorActivity_);

    this.changeId_ = 0;
    this.outstandingChanges_ = {};
    this.dirtyLines_ = [];
  }

  detach() {
    this.codeMirror.off("beforeChange", this.onCodeMirrorBeforeChange_);
    this.codeMirror.off("change", this.onCodeMirrorChange_);
    this.codeMirror.off("changes", this.onCodeMirrorChange_);
    this.codeMirror.off("cursorActivity", this.onCursorActivity_);
    this.clearAnnotations_();
  }

  toggleAttribute(attribute, value) {
    const trueValue = value || true;
    if (this.emptySelection_()) {
      const attrs = this.getCurrentAttributes_();
      if (attrs[attribute] === trueValue) {
        delete attrs[attribute];
      } else {
        attrs[attribute] = trueValue;
      }
      this.currentAttributes_ = attrs;
    } else {
      const attributes = this.getCurrentAttributes_();
      const newValue = attributes[attribute] !== trueValue ? trueValue : false;
      this.setAttribute(attribute, newValue);
    }
  }

  setAttribute(attribute, value) {
    const cm = this.codeMirror;
    if (this.emptySelection_()) {
      const attrs = this.getCurrentAttributes_();
      if (value === false) {
        delete attrs[attribute];
      } else {
        attrs[attribute] = value;
      }
      this.currentAttributes_ = attrs;
    } else {
      this.updateTextAttributes(
        cm.indexFromPos(cm.getCursor("start")),
        cm.indexFromPos(cm.getCursor("end")),
        (attributes) => {
          if (value === false) {
            delete attributes[attribute];
          } else {
            attributes[attribute] = value;
          }
        },
      );

      this.updateCurrentAttributes_();
    }
  }

  updateTextAttributes(start, end, updateFn, origin, doLineAttributes) {
    const newChanges = [];
    let pos = start;
    const self = this;
    this.annotationList_.updateSpan(
      new Span(start, end - start),
      (annotation, length) => {
        const attributes = {};
        for (const attr in annotation.attributes) {
          attributes[attr] = annotation.attributes[attr];
        }

        // Don't modify if this is a line sentinel.
        if (!attributes[ATTR.LINE_SENTINEL] || doLineAttributes)
          updateFn(attributes);

        // changedAttributes will be the attributes we changed, with their new values.
        // changedAttributesInverse will be the attributes we changed, with their old values.
        const changedAttributes = {},
          changedAttributesInverse = {};
        self.computeChangedAttributes_(
          annotation.attributes,
          attributes,
          changedAttributes,
          changedAttributesInverse,
        );
        if (!emptyAttributes(changedAttributes)) {
          newChanges.push({
            start: pos,
            end: pos + length,
            attributes: changedAttributes,
            attributesInverse: changedAttributesInverse,
            origin,
          });
        }

        pos += length;
        return new RichTextAnnotation(attributes);
      },
    );

    if (newChanges.length > 0) {
      this.trigger("attributesChange", this, newChanges);
    }
  }

  computeChangedAttributes_(oldAttrs, newAttrs, changed, inverseChanged) {
    const attrs = {};
    let attr;
    for (attr in oldAttrs) {
      attrs[attr] = true;
    }
    for (attr in newAttrs) {
      attrs[attr] = true;
    }

    for (attr in attrs) {
      if (!(attr in newAttrs)) {
        // it was removed.
        changed[attr] = false;
        inverseChanged[attr] = oldAttrs[attr];
      } else if (!(attr in oldAttrs)) {
        // it was added.
        changed[attr] = newAttrs[attr];
        inverseChanged[attr] = false;
      } else if (oldAttrs[attr] !== newAttrs[attr]) {
        // it was changed.
        changed[attr] = newAttrs[attr];
        inverseChanged[attr] = oldAttrs[attr];
      }
    }
  }

  toggleLineAttribute(attribute, value) {
    const currentAttributes = this.getCurrentLineAttributes_();
    let newValue;
    if (
      !(attribute in currentAttributes) ||
      currentAttributes[attribute] !== value
    ) {
      newValue = value;
    } else {
      newValue = false;
    }
    this.setLineAttribute(attribute, newValue);
  }

  setLineAttribute(attribute, value) {
    this.updateLineAttributesForSelection((attributes) => {
      if (value === false) {
        delete attributes[attribute];
      } else {
        attributes[attribute] = value;
      }
    });
  }

  updateLineAttributesForSelection(updateFn) {
    const cm = this.codeMirror;
    const start = cm.getCursor("start"),
      end = cm.getCursor("end");
    const startLine = start.line;
    let endLine = end.line;
    const endLineText = cm.getLine(endLine);
    const endsAtBeginningOfLine = this.areLineSentinelCharacters_(
      endLineText.substr(0, end.ch),
    );
    if (endLine > startLine && endsAtBeginningOfLine) {
      // If the selection ends at the beginning of a line, don't include that line.
      endLine--;
    }

    this.updateLineAttributes(startLine, endLine, updateFn);
  }

  updateLineAttributes(startLine, endLine, updateFn) {
    // TODO: Batch this into a single operation somehow.
    for (let line = startLine; line <= endLine; line++) {
      const text = this.codeMirror.getLine(line);
      const lineStartIndex = this.codeMirror.indexFromPos({ line, ch: 0 });
      // Create line sentinel character if necessary.
      if (text[0] !== LineSentinelCharacter) {
        const attributes = {};
        attributes[ATTR.LINE_SENTINEL] = true;
        updateFn(attributes);
        this.insertText(lineStartIndex, LineSentinelCharacter, attributes);
      } else {
        this.updateTextAttributes(
          lineStartIndex,
          lineStartIndex + 1,
          updateFn,
          /*origin=*/ null,
          /*doLineAttributes=*/ true,
        );
      }
    }
  }

  replaceText(start, end, text, attributes, origin) {
    this.changeId_++;
    const newOrigin = RichTextOriginPrefix + this.changeId_;
    this.outstandingChanges_[newOrigin] = { origOrigin: origin, attributes };

    const cm = this.codeMirror;
    const from = cm.posFromIndex(start);
    const to = typeof end === "number" ? cm.posFromIndex(end) : null;
    cm.replaceRange(text, from, to, newOrigin);
  }

  insertText(index, text, attributes, origin) {
    const cm = this.codeMirror;
    const cursor = cm.getCursor();
    const resetCursor =
      origin == "RTCMADAPTER" &&
      !cm.somethingSelected() &&
      index == cm.indexFromPos(cursor);
    this.replaceText(index, null, text, attributes, origin);
    if (resetCursor) cm.setCursor(cursor);
  }

  removeText(start, end, origin) {
    const cm = this.codeMirror;
    cm.replaceRange("", cm.posFromIndex(start), cm.posFromIndex(end), origin);
  }

  insertEntityAtCursor(type, info, origin) {
    const cm = this.codeMirror;
    const index = cm.indexFromPos(cm.getCursor("head"));
    this.insertEntityAt(index, type, info, origin);
  }

  insertEntityAt(index, type, info, origin) {
    const cm = this.codeMirror;
    this.insertEntity_(index, new firepad.Entity(type, info), origin);
  }

  insertEntity_(index, entity, origin) {
    this.replaceText(
      index,
      null,
      EntitySentinelCharacter,
      entity.toAttributes(),
      origin,
    );
  }

  getAttributeSpans(start, end) {
    const spans = [];
    const annotatedSpans = this.annotationList_.getAnnotatedSpansForSpan(
      new Span(start, end - start),
    );
    for (let i = 0; i < annotatedSpans.length; i++) {
      spans.push({
        length: annotatedSpans[i].length,
        attributes: annotatedSpans[i].annotation.attributes,
      });
    }

    return spans;
  }

  end() {
    const lastLine = this.codeMirror.lineCount() - 1;
    return this.codeMirror.indexFromPos({
      line: lastLine,
      ch: this.codeMirror.getLine(lastLine).length,
    });
  }

  getRange(start, end) {
    const from = this.codeMirror.posFromIndex(start),
      to = this.codeMirror.posFromIndex(end);
    return this.codeMirror.getRange(from, to);
  }

  initAnnotationList_() {
    // Insert empty annotation span for existing content.
    const end = this.end();
    if (end !== 0) {
      this.annotationList_.insertAnnotatedSpan(
        new Span(0, end),
        new RichTextAnnotation(),
      );
    }
  }

  /**
   * Updates the nodes of an Annotation.
   * @param {Array.<OldAnnotatedSpan>} oldNodes The list of nodes to replace.
   * @param {Array.<NewAnnotatedSpan>} newNodes The new list of nodes.
   */
  onAnnotationsChanged_(oldNodes, newNodes) {
    let marker;

    const linesToReMark = {};

    // Update any entities in-place that we can.  This will remove them from the oldNodes/newNodes lists
    // so we don't remove and recreate them below.
    this.tryToUpdateEntitiesInPlace(oldNodes, newNodes);

    for (var i = 0; i < oldNodes.length; i++) {
      const attributes = oldNodes[i].annotation.attributes;
      if (ATTR.LINE_SENTINEL in attributes) {
        linesToReMark[this.codeMirror.posFromIndex(oldNodes[i].pos).line] =
          true;
      }
      marker = oldNodes[i].getAttachedObject();
      if (marker) {
        marker.clear();
      }
    }

    for (i = 0; i < newNodes.length; i++) {
      const annotation = newNodes[i].annotation;
      const forLine = ATTR.LINE_SENTINEL in annotation.attributes;
      const entity = ATTR.ENTITY_SENTINEL in annotation.attributes;

      const from = this.codeMirror.posFromIndex(newNodes[i].pos);
      if (forLine) {
        linesToReMark[from.line] = true;
      } else if (entity) {
        this.markEntity_(newNodes[i]);
      } else {
        const className = this.getClassNameForAttributes_(
          annotation.attributes,
        );
        if (className !== "") {
          const to = this.codeMirror.posFromIndex(
            newNodes[i].pos + newNodes[i].length,
          );
          marker = this.codeMirror.markText(from, to, { className });
          newNodes[i].attachObject(marker);
        }
      }
    }

    for (const line in linesToReMark) {
      this.dirtyLines_.push(this.codeMirror.getLineHandle(Number(line)));
      this.queueLineMarking_();
    }
  }

  tryToUpdateEntitiesInPlace(oldNodes, newNodes) {
    // Loop over nodes in reverse order so we can easily splice them out as necessary.
    let oldNodesLen = oldNodes.length;
    while (oldNodesLen--) {
      const oldNode = oldNodes[oldNodesLen];
      let newNodesLen = newNodes.length;
      while (newNodesLen--) {
        const newNode = newNodes[newNodesLen];
        if (
          oldNode.pos == newNode.pos &&
          oldNode.length == newNode.length &&
          oldNode.annotation.attributes["ent"] &&
          oldNode.annotation.attributes["ent"] ==
            newNode.annotation.attributes["ent"]
        ) {
          const entityType = newNode.annotation.attributes["ent"];
          if (this.entityManager_.entitySupportsUpdate(entityType)) {
            // Update it in place and remove the change from oldNodes / newNodes so we don't process it below.
            oldNodes.splice(oldNodesLen, 1);
            newNodes.splice(newNodesLen, 1);
            const marker = oldNode.getAttachedObject();
            marker.update(newNode.annotation.attributes);
            newNode.attachObject(marker);
          }
        }
      }
    }
  }

  queueLineMarking_() {
    if (this.lineMarkTimeout_ != null) return;
    const self = this;

    this.lineMarkTimeout_ = setTimeout(() => {
      self.lineMarkTimeout_ = null;
      const dirtyLineNumbers = [];
      for (var i = 0; i < self.dirtyLines_.length; i++) {
        const lineNum = self.codeMirror.getLineNumber(self.dirtyLines_[i]);
        dirtyLineNumbers.push(Number(lineNum));
      }
      self.dirtyLines_ = [];

      dirtyLineNumbers.sort((a, b) => a - b);
      let lastLineMarked = -1;
      for (i = 0; i < dirtyLineNumbers.length; i++) {
        const lineNumber = dirtyLineNumbers[i];
        if (lineNumber > lastLineMarked) {
          lastLineMarked = self.markLineSentinelCharactersForChangedLines_(
            lineNumber,
            lineNumber,
          );
        }
      }
    }, 0);
  }

  addStyleWithCSS_(css) {
    const head = document.getElementsByTagName("head")[0],
      style = document.createElement("style");

    style.type = "text/css";
    if (style.styleSheet) {
      style.styleSheet.cssText = css;
    } else {
      style.appendChild(document.createTextNode(css));
    }

    head.appendChild(style);
  }

  getClassNameForAttributes_(attributes) {
    let globalClassName = "";
    for (const attr in attributes) {
      let val = attributes[attr];
      if (attr === ATTR.LINE_SENTINEL) {
        firepad.utils.assert(
          val === true,
          "LINE_SENTINEL attribute should be true if it exists.",
        );
      } else {
        let className =
          (this.options_["cssPrefix"] || RichTextClassPrefixDefault) + attr;
        if (val !== true) {
          // Append "px" to font size if it's missing.
          // Probably could be removed now as parseHtml automatically adds px when required
          if (attr === ATTR.FONT_SIZE && typeof val !== "string") {
            val = `${val}px`;
          }

          const classVal = val
            .toString()
            .toLowerCase()
            .replace(/[^a-z0-9-_]/g, "-");
          className += `-${classVal}`;
          if (DynamicStyleAttributes[attr]) {
            if (!StyleCache_[attr]) StyleCache_[attr] = {};
            if (!StyleCache_[attr][classVal]) {
              StyleCache_[attr][classVal] = true;
              const dynStyle = DynamicStyleAttributes[attr];
              const css =
                typeof dynStyle === "function"
                  ? dynStyle(val)
                  : `${dynStyle}: ${val}`;

              var selector =
                attr == ATTR.LINE_INDENT ? `pre.${className}` : `.${className}`;

              this.addStyleWithCSS_(`${selector} { ${css} }`);

              // As of v5.48, CodeMirror applies its own pre style which conflicts with ours, so we
              // need to make sure we add our styles with a more-specific css selector as well.
              if (attr === ATTR.LINE_INDENT) {
                var selector = `pre.CodeMirror-line.${className}`;
                this.addStyleWithCSS_(`${selector} { ${css} }`);
              }
            }
          }
        }
        globalClassName = `${globalClassName} ${className}`;
      }
    }
    return globalClassName;
  }

  markEntity_(annotationNode) {
    const attributes = annotationNode.annotation.attributes;
    const entity = firepad.Entity.fromAttributes(attributes);
    const cm = this.codeMirror;
    const self = this;

    const markers = [];
    for (let i = 0; i < annotationNode.length; i++) {
      const from = cm.posFromIndex(annotationNode.pos + i);
      const to = cm.posFromIndex(annotationNode.pos + i + 1);

      const options = {
        collapsed: true,
        atomic: true,
        inclusiveLeft: false,
        inclusiveRight: false,
      };

      const entityHandle = this.createEntityHandle_(entity, annotationNode.pos);

      const element = this.entityManager_.renderToElement(entity, entityHandle);
      if (element) {
        options.replacedWith = element;
      }
      const marker = cm.markText(from, to, options);
      markers.push(marker);
      entityHandle.setMarker(marker);
    }

    annotationNode.attachObject({
      clear() {
        for (let i = 0; i < markers.length; i++) {
          markers[i].clear();
        }
      },

      /**
       * Updates the attributes of all the AnnotationNode entities.
       * @param {Object.<string, string>} info The full list of new
       *     attributes to apply.
       */
      update(info) {
        const entity = firepad.Entity.fromAttributes(info);
        for (let i = 0; i < markers.length; i++) {
          self.entityManager_.updateElement(entity, markers[i].replacedWith);
        }
      },
    });

    // This probably shouldn't be necessary.  There must be a lurking CodeMirror bug.
    this.queueRefresh_();
  }

  queueRefresh_() {
    const self = this;
    if (!this.refreshTimer_) {
      this.refreshTimer_ = setTimeout(() => {
        self.codeMirror.refresh();
        self.refreshTimer_ = null;
      }, 0);
    }
  }

  createEntityHandle_({ type }, location) {
    let marker = null;
    const self = this;

    function find() {
      if (marker) {
        const where = marker.find();
        return where ? self.codeMirror.indexFromPos(where.from) : null;
      } else {
        return location;
      }
    }

    function remove() {
      const at = find();
      if (at != null) {
        self.codeMirror.focus();
        self.removeText(at, at + 1);
      }
    }

    /**
     * Updates the attributes of an Entity.  Will call .update() if the entity supports it,
     * else it'll just remove / re-create the entity.
     * @param {Object.<string, string>} info The full list of new
     *     attributes to apply.
     */
    function replace(info) {
      const ATTR = firepad.AttributeConstants;
      const SENTINEL = ATTR.ENTITY_SENTINEL;
      const PREFIX = `${SENTINEL}_`;

      const at = find();

      self.updateTextAttributes(at, at + 1, (attrs) => {
        for (const member in attrs) {
          delete attrs[member];
        }
        attrs[SENTINEL] = type;

        for (const attr in info) {
          attrs[PREFIX + attr] = info[attr];
        }
      });
    }

    function setMarker(m) {
      marker = m;
    }

    return { find, remove, replace, setMarker };
  }

  lineClassRemover_(lineNum) {
    const cm = this.codeMirror;
    const lineHandle = cm.getLineHandle(lineNum);
    return {
      clear() {
        // HACK to remove all classes (since CodeMirror treats this as a regex internally).
        cm.removeLineClass(lineHandle, "text", ".*");
      },
    };
  }

  emptySelection_() {
    const start = this.codeMirror.getCursor("start"),
      end = this.codeMirror.getCursor("end");
    return start.line === end.line && start.ch === end.ch;
  }

  onCodeMirrorBeforeChange_(cm, change) {
    // Remove LineSentinelCharacters from incoming input (e.g copy/pasting)
    if (change.origin === "+input" || change.origin === "paste") {
      const newText = [];
      for (let i = 0; i < change.text.length; i++) {
        let t = change.text[i];
        t = t.replace(
          new RegExp(
            `[${LineSentinelCharacter}${EntitySentinelCharacter}]`,
            "g",
          ),
          "",
        );
        newText.push(t);
      }
      change.update(change.from, change.to, newText);
    }
  }

  onCodeMirrorChange_(
    cm: CodeMirror,
    cmChanges: EditorChange | EditorChange[],
  ): RichTextChange[] {
    // Handle single change objects and linked lists of change objects.
    if (typeof cmChanges.from === "object") {
      const changeArray: EditorChange[] = [];
      while (cmChanges) {
        changeArray.push(cmChanges);
        cmChanges = cmChanges.next;
      }
      cmChanges = changeArray;
    }

    const changes = this.convertCoordinateSystemForChanges_(
      cmChanges as EditorChange[],
    );
    const newChanges = [];

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const start = change.start;
      const end = change.end;
      const text = change.text;
      const removed = change.removed;
      let origin = change.origin;

      // When text with multiple sets of attributes on it is removed, we need to split it into separate remove changes.
      if (removed.length > 0) {
        const oldAnnotationSpans =
          this.annotationList_.getAnnotatedSpansForSpan(
            new Span(start, removed.length),
          );
        let removedPos = 0;
        for (let j = 0; j < oldAnnotationSpans.length; j++) {
          const span = oldAnnotationSpans[j];
          newChanges.push({
            start,
            end: start + span.length,
            removedAttributes: span.annotation.attributes,
            removed: removed.substr(removedPos, span.length),
            attributes: {},
            text: "",
            origin: change.origin,
          });
          removedPos += span.length;
        }

        this.annotationList_.removeSpan(new Span(start, removed.length));
      }

      if (text.length > 0) {
        let attributes;
        // TODO: Handle 'paste' differently?
        if (change.origin === "+input" || change.origin === "paste") {
          attributes = this.currentAttributes_ || {};
        } else if (origin in this.outstandingChanges_) {
          attributes = this.outstandingChanges_[origin].attributes;
          origin = this.outstandingChanges_[origin].origOrigin;
          delete this.outstandingChanges_[origin];
        } else {
          attributes = {};
        }

        this.annotationList_.insertAnnotatedSpan(
          new Span(start, text.length),
          new RichTextAnnotation(attributes),
        );

        newChanges.push({
          start,
          end: start,
          removedAttributes: {},
          removed: "",
          text,
          attributes,
          origin,
        });
      }
    }

    this.markLineSentinelCharactersForChanges_(cmChanges);

    if (newChanges.length > 0) {
      this.trigger("change", this, newChanges);
    }
  }

  convertCoordinateSystemForChanges_(changes: EditorChange[]) {
    // We have to convert the positions in the pre-change coordinate system to indexes.
    // CodeMirror's `indexFromPos` method does this for the current state of the editor.
    // We can use the information of a single change object to convert a post-change
    // coordinate system to a pre-change coordinate system. We can now proceed inductively
    // to get a pre-change coordinate system for all changes in the linked list.  A
    // disadvantage of this approach is its complexity `O(n^2)` in the length of the
    // linked list of changes.

    const self = this;
    let indexFromPos = (pos: Position) => self.codeMirror.indexFromPos(pos);

    function updateIndexFromPos(
      indexFromPos: {
        (pos: Position): number;
        (arg0: { line: number; ch: any }): number;
      },
      { from, to, text, removed }: EditorChange,
    ) {
      return (pos: Position) => {
        if (posLe(pos, from)) {
          return indexFromPos(pos);
        }
        if (posLe(to, pos)) {
          return (
            indexFromPos({
              line: pos.line + text.length - 1 - (to.line - from.line),
              ch:
                to.line < pos.line
                  ? pos.ch
                  : text.length <= 1
                    ? pos.ch - (to.ch - from.ch) + sumLengths(text)
                    : pos.ch - to.ch + last(text).length,
            }) +
            sumLengths(removed) -
            sumLengths(text)
          );
        }
        if (from.line === pos.line) {
          return indexFromPos(from) + pos.ch - from.ch;
        }
        return (
          indexFromPos(from) +
          sumLengths(removed!.slice(0, pos.line - from.line)) +
          1 +
          pos.ch
        );
      };
    }

    const newChanges = [];
    for (let i = changes.length - 1; i >= 0; i--) {
      const change = changes[i];
      indexFromPos = updateIndexFromPos(indexFromPos, change);

      const start = indexFromPos(change.from);

      const removedText = change.removed!.join("\n");
      const text = change.text.join("\n");
      newChanges.unshift({
        start,
        end: start + removedText.length,
        removed: removedText,
        text,
        origin: change.origin,
      });
    }
    return newChanges;
  }

  /**
   * Detects whether any line sentinel characters were added or removed by the change and if so,
   * re-marks line sentinel characters on the affected range of lines.
   * @param changes
   * @private
   */
  markLineSentinelCharactersForChanges_(changes: EditorChange[]) {
    // TODO: This doesn't handle multiple changes correctly (overlapping, out-of-oder, etc.).
    // But In practice, people using firepad for rich-text editing don't batch multiple changes
    // together, so this isn't quite as bad as it seems.
    let startLine = Number.MAX_VALUE,
      endLine = -1;

    for (let i = 0; i < changes.length; i++) {
      const change = changes[i];
      const line = change.from.line,
        ch = change.from.ch;

      if (
        change.removed!.length > 1 ||
        change.removed![0].includes(LineSentinelCharacter)
      ) {
        // We removed 1+ newlines or line sentinel characters.
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line);
      }

      if (change.text.length > 1) {
        // 1+ newlines
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line + change.text.length - 1);
      } else if (change.text[0].includes(LineSentinelCharacter)) {
        startLine = Math.min(startLine, line);
        endLine = Math.max(endLine, line);
      }
    }

    // HACK: Because the above code doesn't handle multiple changes correctly, endLine might be invalid.  To
    // avoid crashing, we just cap it at the line count.
    endLine = Math.min(endLine, this.codeMirror.lineCount() - 1);

    this.markLineSentinelCharactersForChangedLines_(startLine, endLine);
  }

  markLineSentinelCharactersForChangedLines_(
    startLine: number,
    endLine: number,
  ) {
    // Back up to first list item.
    if (startLine < Number.MAX_VALUE) {
      while (startLine > 0 && this.lineIsListItemOrIndented_(startLine - 1)) {
        startLine--;
      }
    }

    // Advance to last list item.
    if (endLine > -1) {
      const lineCount = this.codeMirror.lineCount();
      while (
        endLine + 1 < lineCount &&
        this.lineIsListItemOrIndented_(endLine + 1)
      ) {
        endLine++;
      }
    }

    // keeps track of the list number at each indent level.
    let listNumber = [];

    const cm = this.codeMirror;
    for (let line = startLine; line <= endLine; line++) {
      const text = cm.getLine(line);

      // Remove any existing line classes.
      const lineHandle = cm.getLineHandle(line);
      cm.removeLineClass(lineHandle, "text", ".*");

      if (text.length > 0) {
        let markIndex = text.indexOf(LineSentinelCharacter);
        while (markIndex >= 0) {
          const markStartIndex = markIndex;

          // Find the end of this series of sentinel characters, and remove any existing markers.
          while (
            markIndex < text.length &&
            text[markIndex] === LineSentinelCharacter
          ) {
            const marks = cm.findMarksAt({ line, ch: markIndex });
            for (let i = 0; i < marks.length; i++) {
              if (marks[i].isForLineSentinel) {
                marks[i].clear();
              }
            }

            markIndex++;
          }

          this.markLineSentinelCharacters_(
            line,
            markStartIndex,
            markIndex,
            listNumber,
          );
          markIndex = text.indexOf(LineSentinelCharacter, markIndex);
        }
      } else {
        // Reset all indents.
        listNumber = [];
      }
    }
    return endLine;
  }

  markLineSentinelCharacters_(line, startIndex, endIndex, listNumber) {
    const cm = this.codeMirror;
    // If the mark is at the beginning of the line and it represents a list element, we need to replace it with
    // the appropriate html element for the list heading.
    let element = null;
    var marker = null;
    const getMarkerLine = () => {
      const span = marker.find();
      return span ? span.from.line : null;
    };

    if (startIndex === 0) {
      const attributes = this.getLineAttributes_(line);
      const listType = attributes[ATTR.LIST_TYPE];
      let indent = attributes[ATTR.LINE_INDENT] || 0;
      if (listType && indent === 0) {
        indent = 1;
      }
      while (indent >= listNumber.length) {
        listNumber.push(1);
      }
      if (listType === "o") {
        element = this.makeOrderedListElement_(listNumber[indent]);
        listNumber[indent]++;
      } else if (listType === "u") {
        element = this.makeUnorderedListElement_();
        listNumber[indent] = 1;
      } else if (listType === "t") {
        element = this.makeTodoListElement_(false, getMarkerLine);
        listNumber[indent] = 1;
      } else if (listType === "tc") {
        element = this.makeTodoListElement_(true, getMarkerLine);
        listNumber[indent] = 1;
      }

      const className = this.getClassNameForAttributes_(attributes);
      if (className !== "") {
        this.codeMirror.addLineClass(line, "text", className);
      }

      // Reset deeper indents back to 1.
      listNumber[indent + 1] = 1;
    }

    // Create a marker to cover this series of sentinel characters.
    // NOTE: The reason we treat them as a group (one marker for all subsequent sentinel characters instead of
    // one marker for each sentinel character) is that CodeMirror seems to get angry if we don't.
    const markerOptions = { inclusiveLeft: true, collapsed: true };
    if (element) {
      markerOptions.replacedWith = element;
    }
    var marker = cm.markText(
      { line, ch: startIndex },
      { line, ch: endIndex },
      markerOptions,
    );
    // track that it's a line-sentinel character so we can identify it later.
    marker.isForLineSentinel = true;
  }

  makeOrderedListElement_(number) {
    return utils.elt("div", `${number}.`, {
      class: "firepad-list-left",
    });
  }

  makeUnorderedListElement_() {
    return utils.elt("div", "\u2022", {
      class: "firepad-list-left",
    });
  }

  toggleTodo(noRemove) {
    const attribute = ATTR.LIST_TYPE;
    const currentAttributes = this.getCurrentLineAttributes_();
    let newValue;
    if (
      !(attribute in currentAttributes) ||
      (currentAttributes[attribute] !== "t" &&
        currentAttributes[attribute] !== "tc")
    ) {
      newValue = "t";
    } else if (currentAttributes[attribute] === "t") {
      newValue = "tc";
    } else if (currentAttributes[attribute] === "tc") {
      newValue = noRemove ? "t" : false;
    }
    this.setLineAttribute(attribute, newValue);
  }

  makeTodoListElement_(checked, getMarkerLine) {
    const params = {
      type: "checkbox",
      class: "firepad-todo-left",
    };
    if (checked) params["checked"] = true;
    const el = utils.elt("input", false, params);
    const self = this;
    utils.on(
      el,
      "click",
      utils.stopEventAnd((e) => {
        self.codeMirror.setCursor({ line: getMarkerLine(), ch: 1 });
        self.toggleTodo(true);
      }),
    );
    return el;
  }

  lineIsListItemOrIndented_(lineNum) {
    const attrs = this.getLineAttributes_(lineNum);
    return (
      (attrs[ATTR.LIST_TYPE] || false) !== false ||
      (attrs[ATTR.LINE_INDENT] || 0) !== 0
    );
  }

  onCursorActivity_() {
    const self = this;
    setTimeout(() => {
      self.updateCurrentAttributes_();
    }, 1);
  }

  getCurrentAttributes_() {
    if (!this.currentAttributes_) {
      this.updateCurrentAttributes_();
    }
    return this.currentAttributes_;
  }

  updateCurrentAttributes_() {
    const cm = this.codeMirror;
    const anchor = cm.indexFromPos(cm.getCursor("anchor")),
      head = cm.indexFromPos(cm.getCursor("head"));
    let pos = head;
    if (anchor > head) {
      // backwards selection
      // Advance past any newlines or line sentinels.
      while (pos < this.end()) {
        var c = this.getRange(pos, pos + 1);
        if (c !== "\n" && c !== LineSentinelCharacter) break;
        pos++;
      }
      if (pos < this.end()) pos++; // since we're going to look at the annotation span to the left to decide what attributes to use.
    } else {
      // Back up before any newlines or line sentinels.
      while (pos > 0) {
        c = this.getRange(pos - 1, pos);
        if (c !== "\n" && c !== LineSentinelCharacter) break;
        pos--;
      }
    }
    const spans = this.annotationList_.getAnnotatedSpansForPos(pos);
    this.currentAttributes_ = {};

    let attributes = {};
    // Use the attributes to the left unless they're line attributes (in which case use the ones to the right.
    if (
      spans.length > 0 &&
      !(ATTR.LINE_SENTINEL in spans[0].annotation.attributes)
    ) {
      attributes = spans[0].annotation.attributes;
    } else if (spans.length > 1) {
      firepad.utils.assert(
        !(ATTR.LINE_SENTINEL in spans[1].annotation.attributes),
        "Cursor can't be between two line sentinel characters.",
      );
      attributes = spans[1].annotation.attributes;
    }
    for (const attr in attributes) {
      // Don't copy line or entity attributes.
      if (
        attr !== "l" &&
        attr !== "lt" &&
        attr !== "li" &&
        attr.indexOf(ATTR.ENTITY_SENTINEL) !== 0
      ) {
        this.currentAttributes_[attr] = attributes[attr];
      }
    }
  }

  getCurrentLineAttributes_() {
    const cm = this.codeMirror;
    const anchor = cm.getCursor("anchor"),
      head = cm.getCursor("head");
    let line = head.line;
    // If it's a forward selection and the cursor is at the beginning of a line, use the previous line.
    if (head.ch === 0 && anchor.line < head.line) {
      line--;
    }
    return this.getLineAttributes_(line);
  }

  getLineAttributes_(lineNum) {
    const attributes = {};
    const line = this.codeMirror.getLine(lineNum);
    if (line.length > 0 && line[0] === LineSentinelCharacter) {
      const lineStartIndex = this.codeMirror.indexFromPos({
        line: lineNum,
        ch: 0,
      });
      const spans = this.annotationList_.getAnnotatedSpansForSpan(
        new Span(lineStartIndex, 1),
      );
      firepad.utils.assert(spans.length === 1);
      for (const attr in spans[0].annotation.attributes) {
        attributes[attr] = spans[0].annotation.attributes[attr];
      }
    }
    return attributes;
  }

  clearAnnotations_() {
    this.annotationList_.updateSpan(
      new Span(0, this.end()),
      (annotation, length) => new RichTextAnnotation({}),
    );
  }

  newline() {
    const cm = this.codeMirror;
    const self = this;
    if (!this.emptySelection_()) {
      cm.replaceSelection("\n", "end", "+input");
    } else {
      const cursorLine = cm.getCursor("head").line;
      const lineAttributes = this.getLineAttributes_(cursorLine);
      const listType = lineAttributes[ATTR.LIST_TYPE];

      if (listType && cm.getLine(cursorLine).length === 1) {
        // They hit enter on a line with just a list heading.  Just remove the list heading.
        this.updateLineAttributes(cursorLine, cursorLine, (attributes) => {
          delete attributes[ATTR.LIST_TYPE];
          delete attributes[ATTR.LINE_INDENT];
        });
      } else {
        cm.replaceSelection("\n", "end", "+input");

        // Copy line attributes forward.
        this.updateLineAttributes(
          cursorLine + 1,
          cursorLine + 1,
          (attributes) => {
            for (const attr in lineAttributes) {
              attributes[attr] = lineAttributes[attr];
            }

            // Don't mark new todo items as completed.
            if (listType === "tc") attributes[ATTR.LIST_TYPE] = "t";
            self.trigger("newLine", { line: cursorLine + 1, attr: attributes });
          },
        );
      }
    }
  }

  deleteLeft() {
    const cm = this.codeMirror;
    const cursorPos = cm.getCursor("head");
    const lineAttributes = this.getLineAttributes_(cursorPos.line);
    const listType = lineAttributes[ATTR.LIST_TYPE];
    const indent = lineAttributes[ATTR.LINE_INDENT];

    const backspaceAtStartOfLine = this.emptySelection_() && cursorPos.ch === 1;

    if (backspaceAtStartOfLine && listType) {
      // They hit backspace at the beginning of a line with a list heading.  Just remove the list heading.
      this.updateLineAttributes(
        cursorPos.line,
        cursorPos.line,
        (attributes) => {
          delete attributes[ATTR.LIST_TYPE];
          delete attributes[ATTR.LINE_INDENT];
        },
      );
    } else if (backspaceAtStartOfLine && indent && indent > 0) {
      this.unindent();
    } else {
      cm.deleteH(-1, "char");
    }
  }

  deleteRight() {
    const cm = this.codeMirror;
    const cursorPos = cm.getCursor("head");

    const text = cm.getLine(cursorPos.line);
    const emptyLine = this.areLineSentinelCharacters_(text);
    const nextLineText =
      cursorPos.line + 1 < cm.lineCount() ? cm.getLine(cursorPos.line + 1) : "";
    if (
      this.emptySelection_() &&
      emptyLine &&
      nextLineText[0] === LineSentinelCharacter
    ) {
      // Delete the empty line but not the line sentinel character on the next line.
      cm.replaceRange(
        "",
        { line: cursorPos.line, ch: 0 },
        { line: cursorPos.line + 1, ch: 0 },
        "+input",
      );

      // HACK: Once we've deleted this line, the cursor will be between the newline on the previous
      // line and the line sentinel character on the next line, which is an invalid position.
      // CodeMirror tends to therefore move it to the end of the previous line, which is undesired.
      // So we explicitly set it to ch: 0 on the current line, which seems to move it after the line
      // sentinel character(s) as desired.
      // (see https://github.com/firebase/firepad/issues/209).
      cm.setCursor({ line: cursorPos.line, ch: 0 });
    } else {
      cm.deleteH(1, "char");
    }
  }

  indent() {
    this.updateLineAttributesForSelection((attributes) => {
      const indent = attributes[ATTR.LINE_INDENT];
      const listType = attributes[ATTR.LIST_TYPE];

      if (indent) {
        attributes[ATTR.LINE_INDENT]++;
      } else if (listType) {
        // lists are implicitly already indented once.
        attributes[ATTR.LINE_INDENT] = 2;
      } else {
        attributes[ATTR.LINE_INDENT] = 1;
      }
    });
  }

  unindent() {
    this.updateLineAttributesForSelection((attributes) => {
      const indent = attributes[LineAttributes.Indent];

      if (indent && indent > 1) {
        attributes[LineAttributes.Indent] = indent - 1;
      } else {
        delete attributes[LineAttributes.ListItem];
        delete attributes[LineAttributes.Indent];
      }
    });
  }

  getText() {
    return this.codeMirror
      .getValue()
      .replace(new RegExp(LineAttributes.Sentinel, "g"), "");
  }

  areLineSentinelCharacters_(text: string) {
    for (let i = 0; i < text.length; i++) {
      if (text[i] !== LineAttributes.Sentinel) return false;
    }
    return true;
  }
}

utils.makeEventEmitter(RichTextCodeMirror, [
  "change",
  "attributesChange",
  "newLine",
]);

// const LineSentinelCharacter = firepad.sentinelConstants.LINE_SENTINEL_CHARACTER;
// const EntitySentinelCharacter =
//   firepad.sentinelConstants.ENTITY_SENTINEL_CHARACTER;

function cmpPos({ line, ch }, { line, ch }) {
  return line - line || ch - ch;
}
function posEq(a, b) {
  return cmpPos(a, b) === 0;
}
function posLe(a, b) {
  return cmpPos(a, b) <= 0;
}

function last(arr) {
  return arr[arr.length - 1];
}

function sumLengths(strArr) {
  if (strArr.length === 0) {
    return 0;
  }
  let sum = 0;
  for (let i = 0; i < strArr.length; i++) {
    sum += strArr[i].length;
  }
  return sum + strArr.length - 1;
}

/**
 * Used for the annotations we store in our AnnotationList.
 * @param attributes
 * @constructor
 */
class RichTextAnnotation {
  attributes: Record<string, any>;

  constructor(attributes?: Record<string, any>) {
    this.attributes = attributes || {};
  }

  equals(other: unknown) {
    if (!(other instanceof RichTextAnnotation)) {
      return false;
    }

    for (const attr in this.attributes) {
      if (other.attributes[attr] !== this.attributes[attr]) {
        return false;
      }
    }

    for (const attr in other.attributes) {
      if (other.attributes[attr] !== this.attributes[attr]) {
        return false;
      }
    }

    return true;
  }
}

function emptyAttributes(attributes: Record<string, unknown>) {
  for (const attr in attributes) {
    return false;
  }
  return true;
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
