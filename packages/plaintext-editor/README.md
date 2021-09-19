# `@otjs/plaintext-editor`

> Editor Client module to Synchronise Plain Text changes across multiple clients.

## Usage

```ts
import { EditorClient, IDatabaseAdapter, IEditorAdapter } from "@otjs/plaintext-editor";

const databaseAdapter: IDatabaseAdapter = ...;
const editorAdapter: IEditorAdapter = ...;

const editorClient = new EditorClient(databaseAdapter, editorAdapter);
```

**Note:** API Guidelines will be provided with the package.

## Reporting a Bug

---

Head on to **Discussion** section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it.

## License

---

This project is licensed under the terms of the MIT license,
see [LICENSE](LICENSE) for more details.
