# `@otjs/fb-monaco`

> Real-time collaborative editor with out of the box binding with Firebase and Monaco Editor.

## Usage

```ts
import { FireMonacoEditor } from "@otjs/fb-monaco";

const rtEditor = new FireMonacoEditor({
  databaseRef:  // Database Reference in Firebase Realtime DB
  editor:       // Monaco Editor instance
  userId:       // Unique Identifier for current user
  userColor:    // Unique Color Code for current user
  userName:     // Human readable Name or Short Name (optional)
});
```
