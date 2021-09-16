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

import { assert, DOMFailureError } from "@otjs/utils";

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
const MAX_ERROR_ON_STYLE_INJECTION: number = 3;

/**
 * Injects Styling for Cursor and/or Selections into Document.
 * @param className - CSS Classname for the Cursor or Selection.
 * @param hightlightColor - Highlight color for selection, `transparent` for cursor.
 * @param cursorColor - Color of cursor at the end.
 */
export async function addStyleRule({
  opacity,
  className,
  cursorColor,
  hightlightColor,
}: {
  opacity: number;
  className: string;
  cursorColor: string;
  hightlightColor: string;
}): Promise<void> {
  assert(document != null, "This package must run on browser!");

  /** Do not re-inject if already exists in DOM or about to be */
  if (classNames.has(className)) {
    return;
  }

  let errorCount: number = classNamesInprogress.get(className) ?? 0;

  /** Throw error if limit exceeded for Retry */
  if (errorCount > MAX_ERROR_ON_STYLE_INJECTION) {
    classNamesInprogress.delete(className);
    throw new DOMFailureError(
      `Failed to inject styles for class ${className}.`
    );
  }

  const style = getStyles(className, hightlightColor, cursorColor, opacity);

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
      opacity,
      className,
      cursorColor,
      hightlightColor,
    });
  }
}

/**
 * Returns CSS Style rules for Cursor and Selection.
 * @param className - CSS Classname for the Cursor or Selection.
 * @param backgroundColor - Background color for selection, `transparent` for cursor.
 * @param borderColor - Border Color for cursor.
 */
function getStyles(
  className: string,
  backgroundColor: string,
  borderColor: string,
  opacity: number
): string {
  return `
    .${className} {
      position: relative;
      opacity: ${opacity};
      background-color: ${backgroundColor};
      border-left: 2px solid ${borderColor};
    }
  `;
}
