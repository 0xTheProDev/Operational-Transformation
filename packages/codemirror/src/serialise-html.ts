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

import { PlainTextOperation } from "@otjs/plaintext";
import { TextAttributes, ListType, LineAttributes } from "./attributes";
import { Entity } from "./entity";
import { EntityManager } from "./entity-manager";

const TODO_STYLE =
  '<style>ul.firepad-todo { list-style: none; margin-left: 0; padding-left: 0; } ul.firepad-todo > li { padding-left: 1em; text-indent: -1em; } ul.firepad-todo > li:before { content: "\\2610"; padding-right: 5px; } ul.firepad-todo > li.firepad-checked:before { content: "\\2611"; padding-right: 5px; }</style>\n';

function open(listType: ListType) {
  return listType === ListType.Ordered
    ? "<ol>"
    : listType === ListType.Unordered
      ? "<ul>"
      : '<ul class="firepad-todo">';
}

function close(listType: ListType) {
  return listType === ListType.Ordered ? "</ol>" : "</ul>";
}

function compatibleListType(l1: ListType, l2: ListType) {
  return (
    l1 === l2 ||
    (l1 === ListType.Todo && l2 === ListType.TodoChecked) ||
    (l1 === ListType.TodoChecked && l2 === ListType.Todo)
  );
}

function textToHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\u00a0/g, "&nbsp;");
}

function serializeHtml(
  { ops }: { ops: PlainTextOperation[] },
  entityManager: EntityManager,
) {
  let html = "";
  let newLine = true;
  const listTypeStack = [];
  let inListItem = false;
  let firstLine = true;
  let emptyLine = true;
  let i = 0,
    op = ops[i];
  let usesTodo = false;
  while (op) {
    // assert(op.isInsert());
    const attrs = op.attributes;

    if (newLine) {
      newLine = false;

      let indent = 0,
        listType = null,
        lineAlign = "left";
      if (LineAttributes.Sentinel in attrs) {
        indent = attrs[LineAttributes.Indent] || 0;
        listType = attrs[LineAttributes.ListItem] || null;
        lineAlign = attrs[LineAttributes.Align] || "left";
      }
      if (listType) {
        indent = indent || 1; // lists are automatically indented at least 1.
      }

      if (inListItem) {
        html += "</li>";
        inListItem = false;
      } else if (!firstLine) {
        if (emptyLine) {
          html += "<br/>";
        }
        html += "</div>";
      }
      firstLine = false;

      // Close any extra lists.
      // assert(indent >= 0, "Indent must not be negative.");
      while (
        listTypeStack.length > indent ||
        (indent === listTypeStack.length &&
          listType !== null &&
          !compatibleListType(
            listType,
            listTypeStack[listTypeStack.length - 1],
          ))
      ) {
        html += close(listTypeStack.pop());
      }

      // Open any needed lists.
      while (listTypeStack.length < indent) {
        const toOpen = listType || ListType.Unordered; // default to unOrdered lists for indenting non-list-item lines.
        usesTodo =
          listType == ListType.Todo ||
          listType == ListType.TodoChecked ||
          usesTodo;
        html += open(toOpen);
        listTypeStack.push(toOpen);
      }

      const style =
        lineAlign !== "left" ? ` style="text-align:${lineAlign}"` : "";
      if (listType) {
        let clazz = "";
        switch (listType) {
          case ListType.TodoChecked:
            clazz = ' class="firepad-checked"';
            break;
          case ListType.Todo:
            clazz = ' class="firepad-unchecked"';
            break;
        }
        html += `<li${clazz}${style}>`;
        inListItem = true;
      } else {
        // start line div.
        html += `<div${style}>`;
      }
      emptyLine = true;
    }

    if (LineAttributes.Sentinel in attrs) {
      op = ops[++i];
      continue;
    }

    if (TextAttributes.EntitySentinel in attrs) {
      for (let j = 0; j < op.text.length; j++) {
        const entity = Entity.fromAttributes(attrs);
        const element = entityManager.exportToElement(entity)!;
        html += element.outerHTML;
      }

      op = ops[++i];
      continue;
    }

    let prefix = "",
      suffix = "";
    for (const attr in attrs) {
      const value = attrs[attr];
      let start, end;
      if (
        attr === TextAttributes.Bold ||
        attr === TextAttributes.Italic ||
        attr === TextAttributes.UnderLine ||
        attr === TextAttributes.Strike
      ) {
        // assert(value === true);
        start = end = attr;
      } else if (attr === TextAttributes.FontSize) {
        start = `span style="font-size: ${value}`;
        start +=
          typeof value !== "string" ||
          value.indexOf("px", value.length - 2) === -1
            ? 'px"'
            : '"';
        end = "span";
      } else if (attr === TextAttributes.Font) {
        start = `span style="font-family: ${value}"`;
        end = "span";
      } else if (attr === TextAttributes.Color) {
        start = `span style="color: ${value}"`;
        end = "span";
      } else if (attr === TextAttributes.BackgroundColor) {
        start = `span style="background-color: ${value}"`;
        end = "span";
      } else {
        // log(false, `Encountered unknown attribute while rendering html: ${attr}`);
      }
      if (start) prefix += `<${start}>`;
      if (end) suffix = `</${end}>${suffix}`;
    }

    let text = op.text;
    const newLineIndex = text.indexOf("\n");
    if (newLineIndex >= 0) {
      newLine = true;
      if (newLineIndex < text.length - 1) {
        // split op.
        op = new TextOp("insert", text.substr(newLineIndex + 1), attrs);
      } else {
        op = ops[++i];
      }
      text = text.substr(0, newLineIndex);
    } else {
      op = ops[++i];
    }

    // Replace leading, trailing, and consecutive spaces with nbsp's to make sure they're preserved.
    text = text
      .replace(/  +/g, ({ length }) => new Array(length + 1).join("\u00a0"))
      .replace(/^ /, "\u00a0")
      .replace(/ $/, "\u00a0");
    if (text.length > 0) {
      emptyLine = false;
    }

    html += prefix + textToHtml(text) + suffix;
  }

  if (inListItem) {
    html += "</li>";
  } else if (!firstLine) {
    if (emptyLine) {
      html += "&nbsp;";
    }
    html += "</div>";
  }

  // Close any extra lists.
  while (listTypeStack.length > 0) {
    html += close(listTypeStack.pop());
  }

  if (usesTodo) {
    html = TODO_STYLE + html;
  }

  return html;
}
