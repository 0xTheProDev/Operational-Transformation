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

import { Handler } from "mitt";

/**
 * @internal
 * Event Emitter Interface - Generic Interface that handles raising Event to outside world.
 */
export interface IEventEmitter<
  Event extends string,
  EventArgs extends Record<Event, any>,
> {
  /**
   * Adds event listener.
   * @param event - Event name.
   * @param listener - Event handler callback.
   */
  on<Key extends keyof EventArgs>(
    event: Key,
    listener: Handler<EventArgs[Key]>,
  ): void;
  /**
   * Removes event listener.
   * @param event - Event name.
   * @param listener - Event handler callback (optional).
   */
  off<Key extends keyof EventArgs>(
    event: Key,
    listener?: Handler<EventArgs[Key]>,
  ): void;
}

export { Handler as IEventHandler };
