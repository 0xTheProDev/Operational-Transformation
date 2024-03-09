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
import { AwaitingWithBuffer } from "../src/awaiting-with-buffer";

describe("Test Awaiting With Buffer State", () => {
  let awaitingWithBuffer: AwaitingWithBuffer,
    client: Partial<IStateMachine>,
    buffer: IOperation,
    outstanding: IOperation,
    composedOp: IOperation;

  beforeAll(() => {
    composedOp = {
      compose: (op: IOperation) => op,
      transform: (op: IOperation) => [op, op],
    };

    buffer = {
      compose: (op: IOperation) => op,
      transform: (op: IOperation) => [op, op],
    };

    outstanding = {
      compose: (op: IOperation) => composedOp,
      transform: (op: IOperation) => [op, op],
    };

    awaitingWithBuffer = new AwaitingWithBuffer(outstanding, buffer);

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
    it("should return false", () => {
      expect(awaitingWithBuffer.isSynchronized()).toBe(false);
    });
  });

  describe("#isAwaitingConfirm", () => {
    it("should return false", () => {
      expect(awaitingWithBuffer.isAwaitingConfirm()).toBe(false);
    });
  });

  describe("#isAwaitingWithBuffer", () => {
    it("should return true", () => {
      expect(awaitingWithBuffer.isAwaitingWithBuffer()).toBe(true);
    });
  });

  describe("#applyClient", () => {
    it("should return a new instance of Awaiting With Buffer state", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(
        awaitingWithBuffer
          .applyClient(client as IStateMachine, incomingOp)
          .isAwaitingWithBuffer(),
      ).toBe(true);
    });
  });

  describe("#applyServer", () => {
    it("should return new instance of Awaiting With Buffer state", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(
        awaitingWithBuffer
          .applyServer(client as IStateMachine, incomingOp)
          .isAwaitingWithBuffer(),
      ).toBe(true);
    });

    it("should apply transformed operation to state machine", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      awaitingWithBuffer.applyServer(client as IStateMachine, incomingOp);
      expect(client.applyOperation).toHaveBeenCalledWith(incomingOp);
    });
  });

  describe("#serverAck", () => {
    it("should return Awaiting Confirm state", () => {
      expect(
        awaitingWithBuffer
          .serverAck(client as IStateMachine)
          .isAwaitingConfirm(),
      ).toBe(true);
    });

    it("should send operation to state machine", () => {
      awaitingWithBuffer.serverAck(client as IStateMachine);
      expect(client.sendOperation).toHaveBeenCalledWith(buffer);
    });
  });

  describe("#serverRetry", () => {
    it("should return Awaiting Confirm state", () => {
      expect(
        awaitingWithBuffer
          .serverRetry(client as IStateMachine)
          .isAwaitingConfirm(),
      ).toBe(true);
    });

    it("should send operation to state machine", () => {
      awaitingWithBuffer.serverRetry(client as IStateMachine);
      expect(client.sendOperation).toHaveBeenCalledWith(composedOp);
    });
  });
});
