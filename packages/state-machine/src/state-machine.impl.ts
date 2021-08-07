import { IOperation } from "@ot/types";
import { assert, NoopError } from "@ot/utils";
import { IState } from "./state";
import { IStateMachine } from "./state-machine";
import { synchronized } from "./synchronized";
import { ITransitionHandler } from "./transition-handler";

/**
 * State Machine - Handles all incoming and outgoing operations and manages serializability to keep content synced acorss all clients.
 * @param handler - Handler for invoking side-effects in outside world.
 */
export class StateMachine implements IStateMachine {
  protected _state: IState = synchronized;
  protected _handler: ITransitionHandler | null;

  constructor(handler: ITransitionHandler) {
    this._handler = handler;
  }

  dispose() {
    this._handler = null;
  }

  isSynchronized(): boolean {
    return this._state.isSynchronized();
  }

  isAwaitingConfirm(): boolean {
    return this._state.isAwaitingConfirm();
  }

  isAwaitingWithBuffer(): boolean {
    return this._state.isAwaitingWithBuffer();
  }

  protected _setState(state: IState): void {
    this._state = state;
  }

  applyClient(operation: IOperation): void {
    this._setState(this._state.applyClient(this, operation));
  }

  applyServer(operation: IOperation): void {
    this._setState(this._state.applyServer(this, operation));
  }

  serverAck(): void {
    this._setState(this._state.serverAck(this));
  }

  serverRetry(): void {
    this._setState(this._state.serverRetry(this));
  }

  sendOperation(operation: IOperation): void {
    assert(this._handler != null, new NoopError());
    this._handler!.sendOperation(operation);
  }

  applyOperation(operation: IOperation): void {
    assert(this._handler != null, new NoopError());
    this._handler!.applyOperation(operation);
  }
}
