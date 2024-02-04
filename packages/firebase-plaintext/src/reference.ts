/**
 * Copyright © 2021 Progyan Bhattacharya
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * See LICENSE file in the root directory for more details.
 */

import { child, DatabaseReference } from "firebase/database";
import { IDisposable, Primitive } from "@otjs/types";
import { memoize, DisposableCollection } from "@otjs/utils";

/** Argument for Data Reference */
type DataRefArg = {
  /** Root Database Reference. */
  databaseRef: DatabaseReference;
};

/**
 * @internal
 * Returns Firebase Database Reference for Checkpoint Data.
 * @param dataRef - Root Database Reference.
 */
export const getCheckpointRef = memoize(
  ({ databaseRef }: DataRefArg) => child(databaseRef, "checkpoint"),
  () => Symbol.for("checkpoint"),
);

/**
 * @internal
 * Returns Firebase Database Reference for History Data.
 * @param dataRef - Root Database Reference.
 */
export const getHistoryRef = memoize(
  ({ databaseRef }: DataRefArg) => child(databaseRef, "history"),
  () => Symbol.for("history"),
);

/**
 * @internal
 * Returns Firebase Database Reference for Users Data.
 * @param dataRef - Root Database Reference.
 */
export const getUsersRef = memoize(
  ({ databaseRef }: DataRefArg) => child(databaseRef, "users"),
  () => Symbol.for("users"),
);

/** Argument for Revision Reference */
type RevisionRefArg = {
  /** Root Database Reference. */
  databaseRef: DatabaseReference;
  /** Unique Identifier of the Revision. */
  revisionId: string;
};

/**
 * @internal
 * Returns Firebase Database Reference for Color for given User.
 * @param revisionRef - Root Database Reference and Unique User Id.
 */
export const getRevisionRef = memoize(
  ({ databaseRef, revisionId }: RevisionRefArg) =>
    child(databaseRef, `history/${revisionId}`),
  ({ revisionId }: RevisionRefArg) => Symbol.for(revisionId),
);

/** Argument for User Reference */
type UserRefArg = {
  /** Root Database Reference. */
  databaseRef: DatabaseReference;
  /** Unique Identifier of the User. */
  userId: string;
};

/** Memoization Logic of User Reference Child Paths */
const userRefResolver = ({ userId }: UserRefArg): Primitive => {
  return Symbol.for(userId);
};

/**
 * @internal
 * Returns Firebase Database Reference for Color for given User.
 * @param userRef - Root Database Reference and Unique User Id.
 */
export const getUserColorRef = memoize(
  ({ databaseRef, userId }: UserRefArg) =>
    child(databaseRef, `users/${userId}/color`),
  userRefResolver,
);

/**
 * @internal
 * Returns Firebase Database Reference for Cursor for given User.
 * @param userRef - Root Database Reference and Unique User Id.
 */
export const getUserCursorRef = memoize(
  ({ databaseRef, userId }: UserRefArg) =>
    child(databaseRef, `users/${userId}/cursor`),
  userRefResolver,
);

/**
 * @internal
 * Returns Firebase Database Reference for User Name for given User.
 * @param userRef - Root Database Reference and Unique User Id.
 */
export const getUserNameRef = memoize(
  ({ databaseRef, userId }: UserRefArg) =>
    child(databaseRef, `users/${userId}/name`),
  userRefResolver,
);

/* istanbul ignore next */
/**
 * @internal
 * Clear Cached Key Value pairs for Memoized functions.
 */
export function clearCache(): IDisposable {
  return new DisposableCollection(
    getCheckpointRef,
    getHistoryRef,
    getRevisionRef,
    getUsersRef,
    getUserColorRef,
    getUserCursorRef,
    getUserNameRef,
  );
}
