import { IStateMachine } from "@ot/state-machine";
import { IOperation } from "@ot/types";
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
          .isAwaitingConfirm()
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
        synchronized.applyServer(client as IStateMachine, operation)
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
      expect(() =>
        synchronized.serverAck(client as IStateMachine)
      ).toThrowError();
    });
  });

  describe("#serverRetry", () => {
    it("should throw error", () => {
      expect(() =>
        synchronized.serverRetry(client as IStateMachine)
      ).toThrowError();
    });
  });
});
