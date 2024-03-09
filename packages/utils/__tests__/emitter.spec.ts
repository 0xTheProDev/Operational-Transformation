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

import { IEventEmitter } from "@otjs/types";

import { EventEmitter } from "../src/emitter";

describe("EventEmitter", () => {
  let emitter: IEventEmitter<string, any>;

  beforeAll(() => {
    class MyEmitter extends EventEmitter<string, any> {}
    emitter = new MyEmitter();
  });

  afterAll(() => {
    // @ts-expect-error Force garbage collection.
    emitter = null;
  });

  describe("#on", () => {
    it("should add listener for an event", () => {
      const evt = "Some Event";
      const evtListener = jest.fn();
      emitter.on(evt, evtListener);

      // @ts-expect-error Calling protected method for unit testing.
      emitter._trigger(evt);
      expect(evtListener).toHaveBeenCalled();
    });

    it("should allow adding more than one listener for same event", () => {
      const evt = "Some Event";
      const evtListenerOne = jest.fn();
      emitter.on(evt, evtListenerOne);

      const evtListenerTwo = jest.fn();
      emitter.on(evt, evtListenerTwo);

      // @ts-expect-error Calling protected method for unit testing.
      emitter._trigger(evt);
      expect(evtListenerOne).toHaveBeenCalled();
      expect(evtListenerTwo).toHaveBeenCalled();
    });
  });

  describe("#off", () => {
    it("should remove listener for an event", () => {
      const evt = "Some Event";
      const evtListener = jest.fn();
      emitter.on(evt, evtListener);
      emitter.off(evt, evtListener);

      // @ts-expect-error Calling protected method for unit testing.
      emitter._trigger(evt);
      expect(evtListener).not.toHaveBeenCalled();
    });

    it("should remove all listener if one not given for an event", () => {
      const evt = "Some Event";
      const evtListenerOne = jest.fn();
      emitter.on(evt, evtListenerOne);

      const evtListenerTwo = jest.fn();
      emitter.on(evt, evtListenerTwo);
      emitter.off(evt);

      // @ts-expect-error Calling protected method for unit testing.
      emitter._trigger(evt);
      expect(evtListenerOne).not.toHaveBeenCalled();
      expect(evtListenerTwo).not.toHaveBeenCalled();
    });
  });

  describe("_trigger", () => {
    it("should emit event with optional payload", () => {
      const evt = "Some Event";
      const evtListener = jest.fn();
      emitter.on(evt, evtListener);

      const evtPayload = { event: true };
      // @ts-expect-error Calling protected method for unit testing.
      emitter._trigger(evt, evtPayload);
      expect(evtListener).toHaveBeenCalledWith(evtPayload);
    });
  });
});
