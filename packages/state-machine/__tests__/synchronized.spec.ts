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

import { IStateMachine } from "@otjs/state-machine";
import { IOperation } from "@otjs/types";
import { synchronized } from "../src/synchronized";

describe("Test Synchronized State", () => {
  let client: Partial<IStateMachine>;

  beforeAll(() => {
    client = {
      applyOperation: jest.fn(),
      sendOperation: jest.fn(),
    };
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("#isSynchronized", () => {
    it("should return true", () => {
      expect(synchronized.isSynchronized()).toBe(true);
    });
  });

  describe("#isAwaitingConfirm", () => {
    it("should return false", () => {
      expect(synchronized.isAwaitingConfirm()).toBe(false);
    });
  });

  describe("#isAwaitingWithBuffer", () => {
    it("should return false", () => {
      expect(synchronized.isAwaitingWithBuffer()).toBe(false);
    });
  });

  describe("#applyClient", () => {
    it("should return Awaiting Confirm state", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(
        synchronized
          .applyClient(client as IStateMachine, operation)
          .isAwaitingConfirm(),
      ).toBe(true);
    });

    it("should send operation to state machine", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      synchronized.applyClient(client as IStateMachine, operation);
      expect(client.sendOperation).toHaveBeenCalledWith(operation);
    });
  });

  describe("#applyServer", () => {
    it("should return same instance", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(
        synchronized.applyServer(client as IStateMachine, operation),
      ).toEqual(synchronized);
    });

    it("should apply operation to state machine", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      synchronized.applyServer(client as IStateMachine, operation);
      expect(client.applyOperation).toHaveBeenCalledWith(operation);
    });
  });

  describe("#serverAck", () => {
    it("should throw error", () => {
      expect(() => synchronized.serverAck(client as IStateMachine)).toThrow();
    });
  });

  describe("#serverRetry", () => {
    it("should throw error", () => {
      expect(() => synchronized.serverRetry(client as IStateMachine)).toThrow();
    });
  });
});
