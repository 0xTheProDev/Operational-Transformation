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

/**
 * Converts color code from Hexadecimal format to RGB format.
 * @param hex - Hexadecimal represenation of color.
 */
export function hexToRgb(
  hex: string
): [red: number, green: number, blue: number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!result) {
    return [0, 0, 0];
  }

  const [, red, green, blue] = result;

  return [parseInt(red, 16), parseInt(green, 16), parseInt(blue, 16)];
}

/**
 * Returns RGB color code from any format.
 */
export function getRgb(
  color: string
): [red: number, green: number, blue: number] {
  if (color.startsWith("#")) {
    /** Hexadecimal Color Code */
    return hexToRgb(color);
  }

  /** Already in rgb() or rgba() */
  const [red, green, blue] = color.replace(/[^\d,]/g, "").split(",");
  return [parseInt(red, 10), parseInt(green, 10), parseInt(blue, 10)];
}
