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

export const textPiecesToInserts = (atNewLine, textPieces) => {
  const inserts = [];

  function insert(string, attributes) {
    if (string instanceof firepad.Text) {
      attributes = string.formatting.attributes;
      string = string.text;
    }

    inserts.push({ string, attributes });
    atNewLine = string[string.length - 1] === "\n";
  }

  function insertLine(line, withNewline) {
    // HACK: We should probably force a newline if there isn't one already.  But due to
    // the way this is used for inserting HTML, we end up inserting a "line" in the middle
    // of text, in which case we don't want to actually insert a newline.
    if (atNewLine) {
      insert(
        firepad.sentinelConstants.LINE_SENTINEL_CHARACTER,
        line.formatting.attributes,
      );
    }

    for (let i = 0; i < line.textPieces.length; i++) {
      insert(line.textPieces[i]);
    }

    if (withNewline) insert("\n");
  }

  for (let i = 0; i < textPieces.length; i++) {
    if (textPieces[i] instanceof firepad.Line) {
      insertLine(textPieces[i], i < textPieces.length - 1);
    } else {
      insert(textPieces[i]);
    }
  }

  return inserts;
};
