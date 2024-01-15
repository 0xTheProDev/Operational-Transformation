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

import { EntityManager } from "./entity-manager";
import { ParseOutput } from "./parse-output";
import { ParseState } from "./parse-state";

let entityManager_: EntityManager;

export function parseHtml(html: string, entityManager: EntityManager) {
  // Create DIV with HTML (as a convenient way to parse it).
  const div = document.createElement("div");
  div.innerHTML = html;

  // HACK until I refactor this.
  entityManager_ = entityManager;

  const output = new ParseOutput();
  const state = new ParseState();
  parseNode(div, state, output);

  return output.lines;
}

// Fix IE8.
const Node = Node || {
  ELEMENT_NODE: 1,
  TEXT_NODE: 3,
};

function parseNode(node, state, output) {
  // Give entity manager first crack at it.
  if (node.nodeType === Node.ELEMENT_NODE) {
    const entity = entityManager_.fromElement(node);
    if (entity) {
      output.currentLine.push(
        new firepad.Text(
          firepad.sentinelConstants.ENTITY_SENTINEL_CHARACTER,
          new firepad.Formatting(entity.toAttributes()),
        ),
      );
      return;
    }
  }

  switch (node.nodeType) {
    case Node.TEXT_NODE:
      // This probably isn't exactly right, but mostly works...
      const text = node.nodeValue.replace(/[ \n\t]+/g, " ");
      output.currentLine.push(firepad.Text(text, state.textFormatting));
      break;
    case Node.ELEMENT_NODE:
      const style = node.getAttribute("style") || "";
      state = parseStyle(state, style);
      switch (node.nodeName.toLowerCase()) {
        case "div":
        case "h1":
        case "h2":
        case "h3":
        case "p":
          output.newlineIfNonEmpty(state);
          parseChildren(node, state, output);
          output.newlineIfNonEmpty(state);
          break;
        case "center":
          state = state.withAlign("center");
          output.newlineIfNonEmpty(state);
          parseChildren(node, state.withAlign("center"), output);
          output.newlineIfNonEmpty(state);
          break;
        case "b":
        case "strong":
          parseChildren(
            node,
            state.withTextFormatting(state.textFormatting.bold(true)),
            output,
          );
          break;
        case "u":
          parseChildren(
            node,
            state.withTextFormatting(state.textFormatting.underline(true)),
            output,
          );
          break;
        case "i":
        case "em":
          parseChildren(
            node,
            state.withTextFormatting(state.textFormatting.italic(true)),
            output,
          );
          break;
        case "s":
          parseChildren(
            node,
            state.withTextFormatting(state.textFormatting.strike(true)),
            output,
          );
          break;
        case "font":
          const face = node.getAttribute("face");
          const color = node.getAttribute("color");
          const size = parseInt(node.getAttribute("size"));
          if (face) {
            state = state.withTextFormatting(state.textFormatting.font(face));
          }
          if (color) {
            state = state.withTextFormatting(state.textFormatting.color(color));
          }
          if (size) {
            state = state.withTextFormatting(
              state.textFormatting.fontSize(size),
            );
          }
          parseChildren(node, state, output);
          break;
        case "br":
          output.newline(state);
          break;
        case "ul":
          output.newlineIfNonEmptyOrListItem(state);
          const listType =
            node.getAttribute("class") === "firepad-todo"
              ? LIST_TYPE.TODO
              : LIST_TYPE.UNORDERED;
          parseChildren(
            node,
            state.withListType(listType).withIncreasedIndent(),
            output,
          );
          output.newlineIfNonEmpty(state);
          break;
        case "ol":
          output.newlineIfNonEmptyOrListItem(state);
          parseChildren(
            node,
            state.withListType(LIST_TYPE.ORDERED).withIncreasedIndent(),
            output,
          );
          output.newlineIfNonEmpty(state);
          break;
        case "li":
          parseListItem(node, state, output);
          break;
        case "style": // ignore.
          break;
        default:
          parseChildren(node, state, output);
          break;
      }
      break;
    default:
      // Ignore other nodes (comments, etc.)
      break;
  }
}

function parseChildren(node, state, output) {
  if (node.hasChildNodes()) {
    for (let i = 0; i < node.childNodes.length; i++) {
      parseNode(node.childNodes[i], state, output);
    }
  }
}

function parseListItem(node, state, output) {
  // Note: <li> is weird:
  // * Only the first line in the <li> tag should be a list item (i.e. with a bullet or number next to it).
  // * <li></li> should create an empty list item line; <li><ol><li></li></ol></li> should create two.

  output.newlineIfNonEmptyOrListItem(state);

  const listType =
    node.getAttribute("class") === "firepad-checked"
      ? LIST_TYPE.TODOCHECKED
      : state.listType;
  output.makeListItem(listType);
  const oldLine = output.currentLine;

  parseChildren(node, state, output);

  if (oldLine === output.currentLine || output.currentLine.length > 0) {
    output.newline(state);
  }
}

function parseStyle(state, styleString) {
  let textFormatting = state.textFormatting;
  let lineFormatting = state.lineFormatting;
  const styles = styleString.split(";");
  for (let i = 0; i < styles.length; i++) {
    const stylePieces = styles[i].split(":");
    if (stylePieces.length !== 2) continue;
    const prop = firepad.utils.trim(stylePieces[0]).toLowerCase();
    const val = firepad.utils.trim(stylePieces[1]).toLowerCase();
    switch (prop) {
      case "text-decoration":
        const underline = val.includes("underline");
        const strike = val.includes("line-through");
        textFormatting = textFormatting.underline(underline).strike(strike);
        break;
      case "font-weight":
        const bold = val === "bold" || parseInt(val) >= 600;
        textFormatting = textFormatting.bold(bold);
        break;
      case "font-style":
        const italic = val === "italic" || val === "oblique";
        textFormatting = textFormatting.italic(italic);
        break;
      case "color":
        textFormatting = textFormatting.color(val);
        break;
      case "background-color":
        textFormatting = textFormatting.backgroundColor(val);
        break;
      case "text-align":
        lineFormatting = lineFormatting.align(val);
        break;
      case "font-size":
        let size = null;
        const allowedValues = [
          "px",
          "pt",
          "%",
          "em",
          "xx-small",
          "x-small",
          "small",
          "medium",
          "large",
          "x-large",
          "xx-large",
          "smaller",
          "larger",
        ];
        if (firepad.utils.stringEndsWith(val, allowedValues)) {
          size = val;
        } else if (parseInt(val)) {
          size = `${parseInt(val)}px`;
        }
        if (size) {
          textFormatting = textFormatting.fontSize(size);
        }
        break;
      case "font-family":
        let font = firepad.utils.trim(val.split(",")[0]); // get first font.
        font = font.replace(/['"]/g, ""); // remove quotes.
        font = font.replace(
          /\w\S*/g,
          (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(),
        );
        textFormatting = textFormatting.font(font);
        break;
    }
  }
  return state
    .withLineFormatting(lineFormatting)
    .withTextFormatting(textFormatting);
}
