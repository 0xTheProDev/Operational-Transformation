import { IStateMachine } from "@ot/state-machine";
import { IOperation } from "@ot/types";
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
          .isAwaitingWithBuffer()
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
          .isAwaitingWithBuffer()
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
          .isAwaitingConfirm()
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
          .isAwaitingConfirm()
      ).toBe(true);
    });

    it("should send operation to state machine", () => {
      awaitingWithBuffer.serverRetry(client as IStateMachine);
      expect(client.sendOperation).toHaveBeenCalledWith(composedOp);
    });
  });
});
