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

import mitt, { Emitter } from "mitt";
import { IEventEmitter, IEventHandler } from "@otjs/types";

/**
 * @internal
 * Abstract Base Class for Event Emitter - This must be extended by Classes with a requirement to fulfill IEventEmitter interface.
 */
export abstract class EventEmitter<
  Event extends string,
  EventArgs extends Record<Event, any>,
> implements IEventEmitter<Event, EventArgs>
{
  /** Event Emitter Instance that dispatces event given in the Map */
  protected readonly _emitter: Emitter<EventArgs> = mitt();

  on<Key extends keyof EventArgs>(
    event: Key,
    listener: IEventHandler<EventArgs[Key]>,
  ): void {
    this._emitter.on(event, listener);
  }

  off<Key extends keyof EventArgs>(
    event: Key,
    listener?: IEventHandler<EventArgs[Key]>,
  ): void {
    this._emitter.off(event, listener);
  }

  /** Trigger an event with optional payload */
  protected _trigger<Key extends keyof EventArgs>(
    event: Key,
    payload: EventArgs[Key],
  ): void {
    this._emitter.emit(event, payload);
  }
}
