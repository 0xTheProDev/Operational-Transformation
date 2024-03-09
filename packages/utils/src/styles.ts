/**
 * Copyright © 2021 - 2024 Progyan Bhattacharya
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

import { assert } from "./assert";
import { getRgb } from "./colors";
import { DOMFailureError } from "./errors";

/**
 * Set of Injected ClassNames in DOM.
 */
const classNames: Set<string> = new Set();

/**
 * Set of ClassNames about to be Injected in DOM.
 */
const classNamesInprogress: Map<string, number> = new Map();

/**
 * Maximum number of error allowed before bailing.
 */
const MAX_ERROR_ON_DOM_OPERATION: number = 3;

/**
 * Injects Styling for Cursor and/or Selections into Document.
 * @param className - CSS Classname for the Cursor or the Selection.
 * @param cursorColor - Color of the Cursor or the Selection.
 */
export async function addStyleRule({
  className,
  cursorColor,
}: {
  className: string;
  cursorColor: string;
}): Promise<void> {
  assert(document != null, "This package must run on browser!");

  /** Do not re-inject if already exists in DOM */
  if (classNames.has(className)) {
    return;
  }

  let errorCount: number = classNamesInprogress.get(className) ?? 0;

  /** Throw error if limit exceeded for Retry */
  if (errorCount > MAX_ERROR_ON_DOM_OPERATION) {
    classNamesInprogress.delete(className);
    throw new DOMFailureError(
      `Failed to inject styles for class ${className}.`,
    );
  }

  const style = getStyles({ className, cursorColor });

  try {
    const styleTextNode = document.createTextNode(style);
    const styleElement = document.createElement("style");

    styleElement.appendChild(styleTextNode);
    document.head.appendChild(styleElement);

    classNamesInprogress.delete(className);
    classNames.add(className);
  } catch (error) {
    /** Retry if any error happens */
    console.error("Error occured while adding CSS into DOM:", error);
    classNamesInprogress.set(className, errorCount + 1);

    return addStyleRule({
      className,
      cursorColor,
    });
  }
}

/**
 * Creates and returns DOM Element for Tooltip.
 * @param className - Class name of the Tooltip element.
 * @param textContent - Content of the Tooltip element.
 */
export async function createTooltipNode({
  className,
  textContent,
}: {
  className: string;
  textContent: string;
}): Promise<HTMLElement> {
  assert(document != null, "This package must run on browser!");

  let errorCount: number = classNamesInprogress.get(className) ?? 0;

  /** Throw error if limit exceeded for Retry */
  if (errorCount > MAX_ERROR_ON_DOM_OPERATION) {
    classNamesInprogress.delete(className);
    throw new DOMFailureError(
      `Failed to create tooltip with class ${className}.`,
    );
  }

  try {
    const tooltipNode = document.createElement("div");
    tooltipNode.className = className;
    tooltipNode.textContent = textContent;
    tooltipNode.setAttribute("role", "tooltip");

    classNamesInprogress.delete(className);
    classNames.add(className);

    return tooltipNode;
  } catch (error) {
    /** Retry if any error happens */
    console.error("Error occured while adding Tooltip into DOM:", error);
    classNamesInprogress.set(className, errorCount + 1);

    return createTooltipNode({ className, textContent });
  }
}

/**
 * Creates and returns DOM Element for Widget.
 * @param className - Class name of the Widget element.
 * @param textContent - Content of the Widget element.
 */
export async function createWidgetNode({
  className,
  childElement,
}: {
  className: string;
  childElement: HTMLElement;
}): Promise<HTMLElement> {
  assert(document != null, "This package must run on browser!");

  let errorCount: number = classNamesInprogress.get(className) ?? 0;

  /** Throw error if limit exceeded for Retry */
  if (errorCount > MAX_ERROR_ON_DOM_OPERATION) {
    classNamesInprogress.delete(className);
    throw new DOMFailureError(
      `Failed to create widget with class ${className}.`,
    );
  }

  try {
    const widgetNode = document.createElement("div");
    widgetNode.className = className;
    widgetNode.appendChild(childElement);

    classNamesInprogress.delete(className);
    classNames.add(className);

    return widgetNode;
  } catch (error) {
    /** Retry if any error happens */
    console.error("Error occured while adding Widget into DOM:", error);
    classNamesInprogress.set(className, errorCount + 1);

    return createWidgetNode({ className, childElement });
  }
}

/**
 * Returns CSS Style rules for Cursor and Selection.
 * @param className - CSS Classname for the Cursor or the Selection.
 * @param cursorColor - Color of the Cursor or the Selection.
 */
function getStyles({
  className,
  cursorColor,
}: {
  className: string;
  cursorColor: string;
}): string {
  return `
    /**
     * Copyright © 2021 - 2024 Progyan Bhattacharya
     * Licensed under the MIT License.
     * See LICENSE in the project root for license information.
     */

    .${className}-cursor {
      position: absolute;
      background-color: transparent;
      border-left: 2px solid ${cursorColor};
    }

    .${className}-selection {
      position: absolute;
      opacity: 0.5;
      background-color: ${cursorColor};
      border-left: 2px solid ${cursorColor};
    }

    .${className}-tooltip {
      opacity: 1;
      padding: 2px 8px;
      font-size: 12px;
      white-space: nowrap;
      border-radius: 2px;
      color: ${getContrastColor(cursorColor)};
      border-color: ${cursorColor};
      background-color: ${cursorColor};
    }

    .${className}-widget {
      height: 20px;
      padding-bottom: 0 !important;
      position: absolute;
      transition: all 0.1s linear;
      z-index: 10000;
    }
  `;
}

/**
 * Returns Text Color (white or black) based on contrasting background.
 * @param backgroundColor - Color of the background.
 */
function getContrastColor(backgroundColor: string): string {
  const [red, blue, green] = getRgb(backgroundColor);

  const brightness = Math.round((red * 299 + blue * 587 + green * 114) / 1000);

  return brightness >= 125 ? "#000000" : "#ffffff";
}
