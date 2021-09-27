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
import {
  child,
  DatabaseReference,
  get,
  getDatabase,
  ref,
  remove,
  set,
  serverTimestamp,
} from "firebase/database";
import { PlainTextOperation } from "@otjs/plaintext";
import { Cursor, DatabaseAdapterEvent } from "@otjs/plaintext-editor";
import { FirebaseAdapter } from "@otjs/firebase-plaintext/src/firebase-adapter";

const {
  /** Firebase Realtime Database URL */
  DATABASE_URL: databaseURL,
} = process.env;

jest.setTimeout(15000 /** 15 seconds */);

describe("Test Firebase Adapter", () => {
  let app: FirebaseApp,
    databaseRef: DatabaseReference,
    firebaseAdapter: FirebaseAdapter;

  beforeAll(async () => {
    app = initializeApp({
      databaseURL,
    });
    databaseRef = ref(getDatabase(app));
    await remove(databaseRef);

    firebaseAdapter = new FirebaseAdapter({
      databaseRef,
      userId: "user2",
      userColor: "#fff",
    });
  });

  afterAll(async () => {
    firebaseAdapter.dispose();

    await remove(databaseRef);
    await deleteApp(app);
  });

  describe("#isCurrentUser", () => {
    it("should return true if argument is same as User Id", () => {
      expect(firebaseAdapter.isCurrentUser("user2")).toBe(true);
    });

    it("should return false if argument is not same as User Id", () => {
      expect(firebaseAdapter.isCurrentUser("user1")).toBe(false);
    });
  });

  describe("#getDocument", () => {
    it("should start with empty Text Document", () => {
      expect(firebaseAdapter.getDocument()).toEqual(new PlainTextOperation());
    });
  });

  describe("#isHistoryEmpty", () => {
    it("should throw error if Adapter is not ready yet", () => {
      expect(() => firebaseAdapter.isHistoryEmpty()).toThrow();
    });

    it("should return true if there is no operation performed yet", () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      expect(firebaseAdapter.isHistoryEmpty()).toBe(true);
      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });
  });

  describe("#setUserId", () => {
    it("should throw Type error if parameter is not string", () => {
      expect(() =>
        firebaseAdapter.setUserId(
          // @ts-expect-error
          24
        )
      ).toThrowError(TypeError);
    });

    it("should update User Id of current user", () => {
      firebaseAdapter.setUserId("user1");
      expect(firebaseAdapter.isCurrentUser("user1")).toBe(true);
    });

    it("should throw error if Adapter already been disposed", () => {
      // @ts-expect-error
      const originalDisposed = firebaseAdapter._disposed;
      // @ts-expect-error
      firebaseAdapter._disposed = true;

      expect(() => firebaseAdapter.setUserId("user3")).toThrow();

      // @ts-expect-error
      firebaseAdapter._disposed = originalDisposed;
    });
  });

  describe("#setUserColor", () => {
    it("should throw Type error if parameter is not string", () => {
      expect(() =>
        firebaseAdapter.setUserColor(
          // @ts-expect-error
          false
        )
      ).toThrowError(TypeError);
    });

    it("should update User Color of current user", async () => {
      firebaseAdapter.setUserColor("#000");
      const colorRef = await get(child(databaseRef, "users/user1/color"));
      expect(colorRef.val() as string).toBe("#000");
    });

    it("should throw error if Adapter already been disposed", () => {
      // @ts-expect-error
      const originalDisposed = firebaseAdapter._disposed;
      // @ts-expect-error
      firebaseAdapter._disposed = true;

      expect(() => firebaseAdapter.setUserColor("#fff")).toThrow();

      // @ts-expect-error
      firebaseAdapter._disposed = originalDisposed;
    });
  });

  describe("#setUserName", () => {
    it("should throw Type error if parameter is not string", () => {
      expect(() =>
        firebaseAdapter.setUserName(
          // @ts-expect-error
          Symbol()
        )
      ).toThrowError(TypeError);
    });

    it("should not throw error if null or undefined is passed as param", () => {
      expect(() => firebaseAdapter.setUserName()).not.toThrow();
    });

    it("should update User Name of current user", async () => {
      firebaseAdapter.setUserName("Anonymous");
      const userNameRef = await get(child(databaseRef, "users/user1/name"));
      expect(userNameRef.val() as string).toBe("Anonymous");
    });

    it("should throw error if Adapter already been disposed", () => {
      // @ts-expect-error
      const originalDisposed = firebaseAdapter._disposed;
      // @ts-expect-error
      firebaseAdapter._disposed = true;

      expect(() => firebaseAdapter.setUserName()).toThrow();

      // @ts-expect-error
      firebaseAdapter._disposed = originalDisposed;
    });
  });

  describe("#sendCursor", () => {
    it("should throw Type error if parameter is not Cursor or null", () => {
      expect(
        firebaseAdapter.sendCursor(
          // @ts-expect-error
          "Cursor"
        )
      ).rejects.toThrowError(TypeError);
    });

    it("should remove Cursor Position of current user", async () => {
      await firebaseAdapter.sendCursor(null);
      const cursorRef = await get(child(databaseRef, "users/user1/cursor"));
      expect(cursorRef.val()).toBeNull();
    });

    it("should update Cursor Position of current user", async () => {
      const cursor = new Cursor(3, 5);
      await firebaseAdapter.sendCursor(cursor);
      const cursorRef = await get(child(databaseRef, "users/user1/cursor"));
      expect(cursorRef.val()).toEqual(cursor.toJSON());
    });

    it("should throw error if Adapter already been disposed", () => {
      // @ts-expect-error
      const originalDisposed = firebaseAdapter._disposed;
      // @ts-expect-error
      firebaseAdapter._disposed = true;

      expect(firebaseAdapter.sendCursor(null)).rejects.toThrow();

      // @ts-expect-error
      firebaseAdapter._disposed = originalDisposed;
    });
  });

  describe("#sendOperation", () => {
    it("should throw error if Adapter already been disposed", () => {
      // @ts-expect-error
      const originalDisposed = firebaseAdapter._disposed;
      // @ts-expect-error
      firebaseAdapter._disposed = true;

      expect(
        firebaseAdapter.sendOperation(new PlainTextOperation())
      ).rejects.toThrow();

      // @ts-expect-error
      firebaseAdapter._disposed = originalDisposed;
    });

    it("should do nothing if Adapter is not ready yet", async () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = false;

      const commited = await firebaseAdapter.sendOperation(
        new PlainTextOperation()
      );
      expect(commited).toBe(false);

      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });

    it("should throw error if invalid operation recieved", () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      const promise = firebaseAdapter.sendOperation(
        new PlainTextOperation().delete("Text")
      );
      expect(promise).rejects.toThrow();

      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });

    it("should call error handler if invalid operation recieved", () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      const errorHandlerFn = jest.fn();
      firebaseAdapter.on(DatabaseAdapterEvent.Error, errorHandlerFn);
      firebaseAdapter
        .sendOperation(new PlainTextOperation().delete("Text"))
        .catch((err) => {
          void err;
        });
      expect(errorHandlerFn).toHaveBeenCalled();
      firebaseAdapter.off(DatabaseAdapterEvent.Error, errorHandlerFn);

      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });

    it("should return `commited: true` once written to Firebase", async () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      const commited = await firebaseAdapter.sendOperation(
        new PlainTextOperation().insert("World")
      );
      expect(commited).toBe(true);

      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });

    it("should save whole document in checkpoint in regular interval", async () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      // @ts-expect-error
      const checkPointFrequency = FirebaseAdapter.CHECKPOINT_FREQUENCY;
      // @ts-expect-error
      FirebaseAdapter.CHECKPOINT_FREQUENCY = 2;

      await firebaseAdapter.sendOperation(
        new PlainTextOperation().retain(5).insert("!")
      );
      const checkpointRef = await get(child(databaseRef, "checkpoint"));
      expect(checkpointRef.val()).toEqual({
        a: "user1",
        o: ["World!"],
        id: "A1",
      });

      // @ts-expect-error
      FirebaseAdapter.CHECKPOINT_FREQUENCY = checkPointFrequency;
      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });
  });

  describe("_initialRevision", () => {
    it("should check in initial checkpoint data and further revisions", (done) => {
      const onOperationFn = jest.fn();
      const _firebaseAdapter = new FirebaseAdapter({
        databaseRef,
        userId: "user2",
        userColor: "#fff",
      });
      _firebaseAdapter.on(DatabaseAdapterEvent.Operation, onOperationFn);
      _firebaseAdapter.on(DatabaseAdapterEvent.Ready, () => {
        expect(onOperationFn).toHaveBeenCalled();
        _firebaseAdapter.dispose();
        done();
      });
    });
  });

  describe("#onAcknowledgement", () => {
    it("should trigger `Acknowledgement` event once commited to Firebase", async () => {
      // @ts-expect-error
      const originalReady = firebaseAdapter._ready;
      // @ts-expect-error
      firebaseAdapter._ready = true;

      const onAcknowledgementFn = jest.fn();
      firebaseAdapter.on(DatabaseAdapterEvent.Acknowledge, onAcknowledgementFn);
      await firebaseAdapter.sendOperation(
        new PlainTextOperation().insert(" ").retain(6)
      );
      expect(onAcknowledgementFn).toHaveBeenCalled();
      firebaseAdapter.off(
        DatabaseAdapterEvent.Acknowledge,
        onAcknowledgementFn
      );

      // @ts-expect-error
      firebaseAdapter._ready = originalReady;
    });
  });

  describe("#onOperation", () => {
    it("should trigger `Operation` event when recieved one from Firebase", async () => {
      const onOperationFn = jest.fn();
      const operation = new PlainTextOperation().insert("Hello ").retain(7);
      firebaseAdapter.on(DatabaseAdapterEvent.Operation, onOperationFn);
      await set(child(databaseRef, "history/A3"), {
        a: "user2",
        o: operation.toJSON(),
        t: serverTimestamp(),
      });
      expect(onOperationFn).toHaveBeenCalledWith(operation);
      firebaseAdapter.off(DatabaseAdapterEvent.Operation, onOperationFn);
    });
  });

  describe("#onCursorChange", () => {
    it("should trigger `CursorChange` event when cursor changes for an user", async () => {
      const cursorData = new Cursor(2, 3).toJSON();
      const onCursorFn = jest.fn();
      firebaseAdapter.on(DatabaseAdapterEvent.CursorChange, onCursorFn);
      await set(child(databaseRef, "users/user2"), {
        color: "#09c",
        cursor: cursorData,
      });
      expect(onCursorFn).toHaveBeenCalledWith({
        clientId: "user2",
        cursor: cursorData,
        userColor: "#09c",
      });
      firebaseAdapter.off(DatabaseAdapterEvent.CursorChange, onCursorFn);
    });

    it("should trigger `CursorChange` event when cursor removed for an user", async () => {
      const onCursorFn = jest.fn();
      firebaseAdapter.on(DatabaseAdapterEvent.CursorChange, onCursorFn);
      await remove(child(databaseRef, "users/user2"));
      expect(onCursorFn).toHaveBeenCalledWith({
        clientId: "user2",
        cursor: null,
      });
      firebaseAdapter.off(DatabaseAdapterEvent.CursorChange, onCursorFn);
    });
  });
});
