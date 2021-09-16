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

import { initializeApp, deleteApp, FirebaseApp } from "firebase/app";
import { getDatabase, DatabaseReference, ref } from "firebase/database";
import {
  getCheckpointRef,
  getHistoryRef,
  getRevisionRef,
  getUsersRef,
  getUserColorRef,
  getUserCursorRef,
  getUserNameRef,
} from "../src/reference";

const {
  /** Firebase Realtime Database URL */
  DATABASE_URL,
  /** Firebase Realtime Database Name */
  DATABASE_NAME,
} = process.env;

describe("Database Reference", () => {
  let app: FirebaseApp, databaseRef: DatabaseReference;

  beforeAll(() => {
    app = initializeApp({
      databaseURL: `${DATABASE_URL}?ns=${DATABASE_NAME}`,
    });
    databaseRef = ref(getDatabase(app));
  });

  afterAll(() => {
    deleteApp(app);
  });

  const getDatabaseURL = (endpoint: string): string =>
    `${DATABASE_URL}/${endpoint}`;

  describe("Test getCheckpointRef", () => {
    it("should return Reference to Checkpoint path in Database", () => {
      const checkpointRef = getCheckpointRef({ databaseRef });
      expect(checkpointRef.toString()).toBe(getDatabaseURL("checkpoint"));
    });
  });

  describe("Test getHistoryRef", () => {
    it("should return Reference to History path in Database", () => {
      const historyRef = getHistoryRef({ databaseRef });
      expect(historyRef.toString()).toBe(getDatabaseURL("history"));
    });
  });

  describe("Test getUsersRef", () => {
    it("should return Reference to Users path in Database", () => {
      const usersRef = getUsersRef({ databaseRef });
      expect(usersRef.toString()).toBe(getDatabaseURL("users"));
    });
  });

  describe("Test getRevisionRef", () => {
    it("should return Reference to Revision path in Database", () => {
      const revisionRef = getRevisionRef({ databaseRef, revisionId: "A1d" });
      expect(revisionRef.toString()).toBe(getDatabaseURL("history/A1d"));
    });
  });

  describe("Test getUserColorRef", () => {
    it("should return Reference to User's Color path in Database", () => {
      const userColorRef = getUserColorRef({ databaseRef, userId: "user1" });
      expect(userColorRef.toString()).toBe(getDatabaseURL("users/user1/color"));
    });
  });

  describe("Test getUserCursorRef", () => {
    it("should return Reference to User's Cursor path in Database", () => {
      const userCursorRef = getUserCursorRef({ databaseRef, userId: "user1" });
      expect(userCursorRef.toString()).toBe(
        getDatabaseURL("users/user1/cursor")
      );
    });
  });

  describe("Test getUserNameRef", () => {
    it("should return Reference to User's Name path in Database", () => {
      const userNameRef = getUserNameRef({ databaseRef, userId: "user1" });
      expect(userNameRef.toString()).toBe(getDatabaseURL("users/user1/name"));
    });
  });
});
