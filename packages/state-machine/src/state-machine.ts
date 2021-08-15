import { IOperation, IDisposable } from "@ot/types";
import { IBase } from "./base";
import { ITransitionHandler } from "./transition-handler";

/**
 * @public
 * State Machine Interface - Handles all incoming and outgoing operations and manages serializability to keep content synced acorss all clients.
 */
export interface IStateMachine extends IBase, IDisposable {
  /**
   * Send operation to remote users.
   * @param operation - Operation from Client.
   */
  applyClient(operation: IOperation): void;
  /**
   * Recieve operation from remote user.
   * @param operation - Operation recieved from Server.
   */
  applyServer(operation: IOperation): void;
  /**
   * Handle acknowledgement from Server.
   */
  serverAck(): void;
  /**
   * Handle retry with Server.
   */
  serverRetry(): void;
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
