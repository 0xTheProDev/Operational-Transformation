/**
 * @public
 * Base Interface - This exposes APIs to identify the current state from outside world.
 */
export interface IBase {
  /**
   * Tests whether the Client State is Synchronized with Server or not.
   */
  isSynchronized(): boolean;
  /**
   * Tests whether the Client State is Waiting for Acknowledgement with Server or not.
   */
  isAwaitingConfirm(): boolean;
  /**
   * Tests whether the Client State is Waiting for Acknowledgement with Server along with pending Operation or not.
   */
  isAwaitingWithBuffer(): boolean;
}
