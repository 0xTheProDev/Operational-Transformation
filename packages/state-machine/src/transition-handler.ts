import { IOperation } from "@ot/types";

/**
 * Transition Handler Interface - Handles side-effects of State transition in outside world.
 */
export interface ITransitionHandler {
  /**
   * Send operation to Server.
   * @param operation - Operation recieved from Client.
   */
  sendOperation(operation: IOperation): void;
  /**
   * Apply operation in Client.
   * @param operation - Operation recieved from Server.
   */
  applyOperation(operation: IOperation): void;
}
