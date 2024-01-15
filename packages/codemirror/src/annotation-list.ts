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

import { Span } from "./span";

function assert(bool: boolean, text?: string) {
  if (!bool) {
    throw new Error(
      `AnnotationList assertion failed${text ? `: ${text}` : ""}`,
    );
  }
}

class OldAnnotatedSpan {
  pos: number;
  length: any;
  annotation: any;
  attachedObject_: any;
  constructor(pos: number, { length, annotation, attachedObject }: any) {
    this.pos = pos;
    this.length = length;
    this.annotation = annotation;
    this.attachedObject_ = attachedObject;
  }

  getAttachedObject() {
    return this.attachedObject_;
  }
}

class NewAnnotatedSpan {
  pos: number;
  length: any;
  annotation: any;
  node_: Node;
  constructor(pos: number, node: Node) {
    this.pos = pos;
    this.length = node.length;
    this.annotation = node.annotation;
    this.node_ = node;
  }

  attachObject(object: any) {
    this.node_.attachedObject = object;
  }
}

const NullAnnotation = {
  equals() {
    return false;
  },
};

export class AnnotationList {
  head_: Node;
  changeHandler_: any;
  constructor(changeHandler: any) {
    // There's always a head node; to avoid special cases.
    this.head_ = new Node(0, NullAnnotation);
    this.changeHandler_ = changeHandler;
  }

  insertAnnotatedSpan({ pos, length }: any, annotation: any) {
    this.wrapOperation_(
      new Span(pos, 0),
      (oldPos: number, old: { next: null; length: any; annotation: any }) => {
        assert(!old || old.next === null); // should be 0 or 1 nodes.
        const toInsert = new Node(length, annotation);
        if (!old) {
          return toInsert;
        } else {
          assert(pos > oldPos && pos < oldPos + old.length);
          const newNodes = new Node(0, NullAnnotation);
          // Insert part of old before insertion point.
          newNodes.next = new Node(pos - oldPos, old.annotation);
          // Insert new node.
          newNodes.next.next = toInsert;
          // Insert part of old after insertion point.
          toInsert.next = new Node(oldPos + old.length - pos, old.annotation);
          return newNodes.next;
        }
      },
    );
  }

  removeSpan(removeSpan: Span) {
    if (removeSpan.length === 0) {
      return;
    }

    this.wrapOperation_(removeSpan, (oldPos: number, old: OldAnnotatedSpan) => {
      assert(old !== null);
      const newNodes = new Node(0, NullAnnotation);
      let current = newNodes;
      // Add new node for part before the removed span (if any).
      if (removeSpan.pos > oldPos) {
        current.next = new Node(removeSpan.pos - oldPos, old.annotation);
        current = current.next;
      }

      // Skip over removed nodes.
      while (removeSpan.end > oldPos + old.length) {
        oldPos += old.length;
        old = old.next;
      }

      // Add new node for part after the removed span (if any).
      const afterChars = oldPos + old.length - removeSpan.end;
      if (afterChars > 0) {
        current.next = new Node(afterChars, old.annotation);
      }

      return newNodes.next;
    });
  }

  updateSpan(span: Span, updateFn: (arg0: any, arg1: number) => any) {
    if (span.length === 0) {
      return;
    }

    this.wrapOperation_(
      span,
      (
        oldPos: any,
        old: { length: number; annotation: any; next: any } | null,
      ) => {
        assert(old !== null);
        const newNodes = new Node(0, NullAnnotation);
        let current = newNodes;
        let currentPos = oldPos;

        // Add node for any characters before the span we're updating.
        const beforeChars = span.pos - currentPos;
        assert(beforeChars < old.length);
        if (beforeChars > 0) {
          current.next = new Node(beforeChars, old.annotation);
          current = current.next;
          currentPos += current.length;
        }

        // Add updated nodes for entirely updated nodes.
        while (old !== null && span.end() >= oldPos + old.length) {
          const length = oldPos + old.length - currentPos;
          current.next = new Node(length, updateFn(old.annotation, length));
          current = current.next;
          oldPos += old.length;
          old = old.next;
          currentPos = oldPos;
        }

        // Add updated nodes for last node.
        const updateChars = span.end() - currentPos;
        if (updateChars > 0) {
          assert(updateChars < old.length);
          current.next = new Node(
            updateChars,
            updateFn(old.annotation, updateChars),
          );
          current = current.next;
          currentPos += current.length;

          // Add non-updated remaining part of node.
          current.next = new Node(
            oldPos + old.length - currentPos,
            old.annotation,
          );
        }

        return newNodes.next;
      },
    );
  }

  wrapOperation_(
    span: Span,
    operationFn: {
      (oldPos: any, old: any): any;
      (oldPos: any, old: any): any;
      (oldPos: any, old: any): any;
      (arg0: any, arg1: any): any;
    },
  ) {
    if (span.pos < 0) {
      throw new Error("Span start cannot be negative.");
    }
    const oldNodes = [],
      newNodes = [];

    const res = this.getAffectedNodes_(span);

    let tail;
    if (res.start !== null) {
      tail = res.end.next;
      // Temporarily truncate list so we can pass it to operationFn.  We'll splice it back in later.
      res.end.next = null;
    } else {
      // start and end are null, because span is empty and lies on the border of two nodes.
      tail = res.succ;
    }

    // Create a new segment to replace the affected nodes.
    let newSegment = operationFn(res.startPos, res.start);

    let includePredInOldNodes = false,
      includeSuccInOldNodes = false;
    if (newSegment) {
      this.mergeNodesWithSameAnnotations_(newSegment);

      let newPos;
      if (res.pred && res.pred.annotation.equals(newSegment.annotation)) {
        // We can merge the pred node with newSegment's first node.
        includePredInOldNodes = true;
        newSegment.length += res.pred.length;

        // Splice newSegment in after beforePred.
        res.beforePred.next = newSegment;
        newPos = res.predPos;
      } else {
        // Splice newSegment in after beforeStart.
        res.beforeStart.next = newSegment;
        newPos = res.startPos;
      }

      // Generate newNodes, but not the last one (since we may be able to merge it with succ).
      while (newSegment.next) {
        newNodes.push(new NewAnnotatedSpan(newPos, newSegment));
        newPos += newSegment.length;
        newSegment = newSegment.next;
      }

      if (res.succ && res.succ.annotation.equals(newSegment.annotation)) {
        // We can merge newSegment's last node with the succ node.
        newSegment.length += res.succ.length;
        includeSuccInOldNodes = true;

        // Splice rest of list after succ after newSegment.
        newSegment.next = res.succ.next;
      } else {
        // Splice tail after newSegment.
        newSegment.next = tail;
      }

      // Add last newSegment node to newNodes.
      newNodes.push(new NewAnnotatedSpan(newPos, newSegment));
    } else {
      // newList is empty.  Try to merge pred and succ.
      if (
        res.pred &&
        res.succ &&
        res.pred.annotation.equals(res.succ.annotation)
      ) {
        includePredInOldNodes = true;
        includeSuccInOldNodes = true;

        // Create succ + pred merged node and splice list together.
        newSegment = new Node(
          res.pred.length + res.succ.length,
          res.pred.annotation,
        );
        res.beforePred.next = newSegment;
        newSegment.next = res.succ.next;

        newNodes.push(
          new NewAnnotatedSpan(res.startPos - res.pred.length, newSegment),
        );
      } else {
        // Just splice list back together.
        res.beforeStart.next = tail;
      }
    }

    // Build list of oldNodes.

    if (includePredInOldNodes) {
      oldNodes.push(new OldAnnotatedSpan(res.predPos, res.pred));
    }

    let oldPos = res.startPos,
      oldSegment = res.start;
    while (oldSegment !== null) {
      oldNodes.push(new OldAnnotatedSpan(oldPos, oldSegment));
      oldPos += oldSegment.length;
      oldSegment = oldSegment.next;
    }

    if (includeSuccInOldNodes) {
      oldNodes.push(new OldAnnotatedSpan(oldPos, res.succ));
    }

    this.changeHandler_(oldNodes, newNodes);
  }

  getAffectedNodes_(span: Span) {
    // We want to find nodes 'start', 'end', 'beforeStart', 'pred', and 'succ' where:
    //  - 'start' contains the first character in span.
    //  - 'end' contains the last character in span.
    //  - 'beforeStart' is the node before 'start'.
    //  - 'beforePred' is the node before 'pred'.
    //  - 'succ' contains the node after 'end' if span.end() was on a node boundary, else null.
    //  - 'pred' contains the node before 'start' if span.pos was on a node boundary, else null.

    const result = {};

    let prevprev = null,
      prev = this.head_,
      current = prev.next,
      currentPos = 0;
    while (current !== null && span.pos >= currentPos + current.length) {
      currentPos += current.length;
      prevprev = prev;
      prev = current;
      current = current.next;
    }
    if (current === null && !(span.length === 0 && span.pos === currentPos)) {
      throw new Error("Span start exceeds the bounds of the AnnotationList.");
    }

    result.startPos = currentPos;
    // Special case if span is empty and on the border of two nodes
    if (span.length === 0 && span.pos === currentPos) {
      result.start = null;
    } else {
      result.start = current;
    }
    result.beforeStart = prev;

    if (currentPos === span.pos && currentPos > 0) {
      result.pred = prev;
      result.predPos = currentPos - prev.length;
      result.beforePred = prevprev;
    } else {
      result.pred = null;
    }

    while (current !== null && span.end > currentPos) {
      currentPos += current.length;
      prev = current;
      current = current.next;
    }
    if (span.end > currentPos) {
      throw new Error("Span end exceeds the bounds of the AnnotationList.");
    }

    // Special case if span is empty and on the border of two nodes.
    if (span.length === 0 && span.end === currentPos) {
      result.end = null;
    } else {
      result.end = prev;
    }
    result.succ = currentPos === span.end ? current : null;

    return result;
  }

  mergeNodesWithSameAnnotations_(list: any) {
    if (!list) {
      return;
    }
    let prev = null,
      curr = list;
    while (curr) {
      if (prev && prev.annotation.equals(curr.annotation)) {
        prev.length += curr.length;
        prev.next = curr.next;
      } else {
        prev = curr;
      }
      curr = curr.next;
    }
  }

  forEach(callback: (arg0: any, arg1: any, arg2: any) => void) {
    let current = this.head_.next;
    while (current !== null) {
      callback(current.length, current.annotation, current.attachedObject);
      current = current.next;
    }
  }

  getAnnotatedSpansForPos(pos: number) {
    let currentPos = 0;
    let current = this.head_.next,
      prev = null;
    while (current !== null && currentPos + current.length <= pos) {
      currentPos += current.length;
      prev = current;
      current = current.next;
    }
    if (current === null && currentPos !== pos) {
      throw new Error("pos exceeds the bounds of the AnnotationList");
    }

    const res = [];
    if (currentPos === pos && prev) {
      res.push(new OldAnnotatedSpan(currentPos - prev.length, prev));
    }
    if (current) {
      res.push(new OldAnnotatedSpan(currentPos, current));
    }
    return res;
  }

  getAnnotatedSpansForSpan(span: Span) {
    if (span.length === 0) {
      return [];
    }
    const oldSpans = [];
    const res = this.getAffectedNodes_(span);
    let currentPos = res.startPos,
      current = res.start;
    while (current !== null && currentPos < span.end) {
      const start = Math.max(currentPos, span.pos),
        end = Math.min(currentPos + current.length, span.end);
      const oldSpan = new Span(start, end - start);
      oldSpan.annotation = current.annotation;
      oldSpans.push(oldSpan);

      currentPos += current.length;
      current = current.next;
    }
    return oldSpans;
  }

  // For testing.
  count() {
    let count = 0;
    let current = this.head_.next,
      prev = null;
    while (current !== null) {
      if (prev) {
        assert(!prev.annotation.equals(current.annotation));
      }
      prev = current;
      current = current.next;
      count++;
    }
    return count;
  }
}

class Node {
  next: Node;
  length: any;
  annotation: { equals: () => boolean };
  attachedObject: null;
  spanLength: number;
  constructor(length: number, annotation: { equals: () => boolean }) {
    this.length = length;
    this.annotation = annotation;
    this.attachedObject = null;
    this.next = null;
  }

  clone() {
    const node = new Node(this.spanLength, this.annotation);
    node.next = this.next;
    return node;
  }
}
