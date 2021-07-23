/**
 * Base Interface for any Transformable Operation.
 */
export interface IOperation {
  /**
   * Compose merges two consecutive operations into one operation, that
   * preserves the changes of both. Or, in other words, for each input string S
   * and a pair of consecutive operations A and B,
   * apply(apply(S, A), B) = apply(S, compose(A, B)) must hold.
   * @param operation - Consecutive Operation to be composed with.
   */
  compose(operation: IOperation): IOperation;
  /**
   * Transform of `A` takes another concurrent operation `B` and
   * produces two operations `A'` and `B'` (in an array) such that
   * `apply(apply(S, A), B') = apply(apply(S, B), A')`.
   * @param operation - Concurrent Operation to be composed with.
   */
  transform(operation: IOperation): [IOperation, IOperation];
}
