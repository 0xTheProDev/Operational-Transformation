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

import { ITransitionHandler } from "@otjs/state-machine";
import { IOperation } from "@otjs/types";
import { StateMachine } from "../src/state-machine.impl";

describe("Test State Machine", () => {
  let client: StateMachine, handler: ITransitionHandler;

  beforeAll(() => {
    handler = {
      applyOperation: jest.fn(),
      sendOperation: jest.fn(),
    };
  });

  beforeEach(() => {
    client = new StateMachine(handler);
  });

  afterEach(() => {
    client.dispose();
    jest.resetAllMocks();
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });

  describe("#isSynchronized", () => {
    it("should return true as it starts in Synchronized state", () => {
      expect(client.isSynchronized()).toBe(true);
    });
  });

  describe("#isAwaitingConfirm", () => {
    it("should return true when the first operation is recieved", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      expect(client.isAwaitingConfirm()).toBe(true);
    });
  });

  describe("#isAwaitingWithBuffer", () => {
    it("should return true when operation is recieved and previous ones pending acknowledgement", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      client.applyClient(operation);
      expect(client.isAwaitingWithBuffer()).toBe(true);
    });
  });

  describe("#applyClient", () => {
    it("should send operation to remote users", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      expect(handler.sendOperation).toHaveBeenCalledWith(operation);
    });
  });

  describe("#applyServer", () => {
    it("should recieve operation from remote users", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyServer(operation);
      expect(handler.applyOperation).toHaveBeenCalledWith(operation);
    });
  });

  describe("#serverAck", () => {
    it("should throw error if state is Synchronized", () => {
      expect(() => client.serverAck()).toThrow();
    });

    it("should transition to Synchronized state if state is Awaiting for Confirm", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      client.serverAck();
      expect(client.isSynchronized()).toBe(true);
    });

    it("should transition to Awaiting for Confirm state if state is Awaiting for Buffer", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      client.applyClient(operation);
      client.serverAck();
      expect(client.isAwaitingConfirm()).toBe(true);
    });
  });

  describe("#serverRetry", () => {
    it("should throw error if state is Synchronized", () => {
      expect(() => client.serverRetry()).toThrow();
    });

    it("should retain state if state is Awaiting for Confirm", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      client.serverRetry();
      expect(client.isAwaitingConfirm()).toBe(true);
    });

    it("should transition to Awaiting for Confirm state if state is Awaiting for Buffer", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyClient(operation);
      client.applyClient(operation);
      client.serverRetry();
      expect(client.isAwaitingConfirm()).toBe(true);
    });
  });

  describe("#sendOperation", () => {
    it("should send operation to remote users", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.sendOperation(operation);
      expect(handler.sendOperation).toHaveBeenCalledWith(operation);
    });

    it("should throw error if already disposed", () => {
      client.dispose();

      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(() => client.sendOperation(operation)).toThrow();
    });
  });

  describe("#applyOperation", () => {
    it("should recieve operation from remote users", () => {
      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      client.applyOperation(operation);
      expect(handler.applyOperation).toHaveBeenCalledWith(operation);
    });

    it("should throw error if already disposed", () => {
      client.dispose();

      const operation: IOperation = {
        compose: (op: IOperation) => op,
        transform: (op: IOperation) => [op, op],
      };
      expect(() => client.applyOperation(operation)).toThrow();
    });
  });
});
