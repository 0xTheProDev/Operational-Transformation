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

import { IStateMachine } from "@otjs/state-machine";
import { IOperation } from "@otjs/types";
import { AwaitingConfirm } from "../src/awaiting-confirm";

describe("Test Awaiting Confirm State", () => {
  let awaitingConfirm: AwaitingConfirm,
    client: Partial<IStateMachine>,
    operation: IOperation,
    transformedOp: IOperation;

  beforeAll(() => {
    transformedOp = {
      compose: (op: IOperation) => op,
      transform: (op: IOperation) => [op, op],
    };

    operation = {
      compose: (op: IOperation) => op,
      transform: (op: IOperation) => [op, transformedOp],
    };

    awaitingConfirm = new AwaitingConfirm(operation);

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
      expect(awaitingConfirm.isSynchronized()).toBe(false);
    });
  });

  describe("#isAwaitingConfirm", () => {
    it("should return true", () => {
      expect(awaitingConfirm.isAwaitingConfirm()).toBe(true);
    });
  });

  describe("#isAwaitingWithBuffer", () => {
    it("should return false", () => {
      expect(awaitingConfirm.isAwaitingWithBuffer()).toBe(false);
    });
  });

  describe("#applyClient", () => {
    it("should return Awaiting With Buffer state", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, transformedOp],
      };
      expect(
        awaitingConfirm
          .applyClient(client as IStateMachine, incomingOp)
          .isAwaitingWithBuffer()
      ).toBe(true);
    });
  });

  describe("#applyServer", () => {
    it("should return new instance of Awaiting Confirm state", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, transformedOp],
      };
      expect(
        awaitingConfirm
          .applyServer(client as IStateMachine, incomingOp)
          .isAwaitingConfirm()
      ).toBe(true);
    });

    it("should apply transformed operation to state machine", () => {
      const incomingOp: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, transformedOp],
      };
      awaitingConfirm.applyServer(client as IStateMachine, incomingOp);
      expect(client.applyOperation).toHaveBeenCalledWith(transformedOp);
    });
  });

  describe("#serverAck", () => {
    it("should return Synchronized state", () => {
      expect(
        awaitingConfirm.serverAck(client as IStateMachine).isSynchronized()
      ).toBe(true);
    });
  });

  describe("#serverRetry", () => {
    it("should return same instance", () => {
      expect(awaitingConfirm.serverRetry(client as IStateMachine)).toEqual(
        awaitingConfirm
      );
    });
  });
});
