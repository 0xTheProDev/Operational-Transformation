# `@operational-transformation/plaintext-editor`

> Editor Client module to Synchronise Plain Text changes across multiple clients.

## Usage

```ts
import { EditorClient, IDatabaseAdapter, IEditorAdapter } from "@operational-transformation/plaintext-editor";

const databaseAdapter: IDatabaseAdapter = ...;
const editorAdapter: IEditorAdapter = ...;

const editorClient = new EditorClient(databaseAdapter, editorAdapter);
```

**Note:** API Guidelines will be provided with the package.

## License

MIT License. See [LICENSE](LICENSE) for more details.
