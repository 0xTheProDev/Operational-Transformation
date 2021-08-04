import { IStateMachine } from "@ot/state-machine";
import { IOperation } from "@ot/types";
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
