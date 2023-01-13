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

import { IPlainTextOperation, PlainTextOperation } from "@otjs/plaintext";
import { assert } from "@otjs/utils";
import { TParsedRevision, TRevision } from "./internal-types";

// Based off ideas from http://www.zanopha.com/docs/elen.pdf
const characters =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

/**
 * @internal
 * Returns Database key for `history` node based on current Revision index _(0-based)_.
 * @param revision - Current Revision Index.
 */
export function revisionToId(revision: number): string {
  if (revision === 0) {
    return "A0";
  }

  let str: string = "";

  while (revision > 0) {
    const digit: number = revision % characters.length;
    str = characters[digit] + str;
    revision -= digit;
    revision /= characters.length;
  }

  // Prefix with length (starting at 'A' for length 1) to ensure the id's sort lexicographically.
  const prefix = characters[str.length + 9];
  return `${prefix}${str}`;
}

/**
 * @internal
 * Returns Revision Index _(0-based)_ based on Database key provided.
 * @param revisionId - Database key for `history` node.
 */
export function revisionFromId(revisionId: string): number {
  assert(
    revisionId.length > 0 &&
      revisionId[0] === characters[revisionId.length + 8],
    "Invalid `revisionId` given to function `revisionFromId`",
  );

  let revision: number = 0;

  for (let i = 1; i < revisionId.length; i++) {
    revision *= characters.length;
    revision += characters.indexOf(revisionId[i]);
  }

  return revision;
}

/**
 * @internal
 * Returns parsed Text Operation with metadata for given JSON representation of the same.
 * @param document - Current State of the Document
 * @param data - Partial representation of the Text Operation in Firebase.
 */
export function parseRevision(
  document: IPlainTextOperation,
  data: TRevision,
): TParsedRevision | null {
  // We could do some of this validation via security rules.  But it's nice to be robust, just in case.
  if (typeof data.a !== "string" || typeof data.o !== "object") {
    return null;
  }

  let op: PlainTextOperation;

  try {
    op = PlainTextOperation.fromJSON(data.o);
  } catch (e) {
    return null;
  }

  if (!document.canMergeWith(op)) {
    return null;
  }

  return {
    author: data.a,
    operation: op,
  };
}
