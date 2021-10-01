# `@otjs/monaco`

[![Npm Version](https://img.shields.io/npm/v/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Types](https://img.shields.io/npm/types/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![License](https://img.shields.io/npm/l/@otjs/monaco)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/monaco/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/monaco)](https://www.npmjs.com/package/@otjs/monaco)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/monaco)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> Editor Adapter implementation for Monaco.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/monaco
```

- To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/monaco
```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![Monaco Editor](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/monaco-editor)](https://www.npmjs.com/package/monaco-editor)

## Usage

---

```ts
import { MonacoAdapter } from "@otjs/monaco";

const monacoAdapter = new MonacoAdapter({
  editor:                   // Monaco Editor Instance
  announcementDuration:     // Duration (in ms) of User Name Announcement beside Cursor (optional)
  bindEvents:               // Boolean on whether or not to emit events from Adapter (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/monaco`. Please refer to root [README](https://github.com/Progyan1997/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns monaco.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/Progyan1997/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/Progyan1997/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/monaco/LICENSE) for more details.
