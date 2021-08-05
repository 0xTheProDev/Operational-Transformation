import { ITransitionHandler, StateMachine } from "@ot/state-machine";
import { IDisposable, IOperation } from "@ot/types";
import { InjectStateMachine } from "../src/state-machine.decor";

class HandlerImplementation implements ITransitionHandler, IDisposable {
  @InjectStateMachine()
  public readonly stateMachine!: StateMachine;

  dispose() {
    this.stateMachine.dispose();
  }

  applyOperation(operation: IOperation): void {}
  sendOperation(operation: IOperation): void {}
}

describe("Test State Machine Decorator", () => {
  let handler: HandlerImplementation;

  beforeEach(() => {
    handler = new HandlerImplementation();
  });

  afterEach(() => {
    handler.dispose();
  });

  it("should inject a State Machine instance as property", () => {
    expect(handler.stateMachine.isSynchronized()).toBe(true);
  });
});
