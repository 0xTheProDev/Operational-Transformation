/**
 * @public
 * Disposable Interface - Classes with side-effect should extend this interface to add additional cleanup rules.
 * Applicable to the Interfaces/Objects that requires cleanup after usage.
 */
export interface IDisposable {
  /**
   * Cleanup Method.
   */
  dispose(): void;
}
