# `@operational-transformation/firebase-adapter`

> Database Adapter implementation for Firebase.

## Usage

```ts
import { FirebaseAdapter } from "@operational-transformation/firebase-adapter";

const firebaseAdapter = new FirebaseAdapter({
  databaseRef:  // Database Reference in Firebase Realtime DB
  userId:       // Unique Identifier for current user
  userColor:    // Unique Color Code for current user
  userName:     // Human readable Name or Short Name (optional)
});
```

**Note:** API Guidelines will be provided with the package.

## License

MIT License. See [LICENSE](LICENSE) for more details.
