# `@otjs/firebase-monaco`

[![Npm Version](https://img.shields.io/npm/v/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Types](https://img.shields.io/npm/types/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![License](https://img.shields.io/npm/l/@otjs/firebase-monaco)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/firebase-monaco/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/firebase-monaco)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> Real-time collaborative editor with out of the box binding with Firebase and Monaco Editor.

## Installation

* To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/firebase-monaco
```

* To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/firebase-monaco
```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![Firebase](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/firebase)](https://www.npmjs.com/package/firebase)
[![Monaco Editor](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/monaco-editor)](https://www.npmjs.com/package/monaco-editor)

## Usage

```ts
import { FireMonacoEditor } from "@otjs/firebase-monaco";

const fireMonaco = new FireMonacoEditor({
  databaseRef:            // Database Reference in Firebase Realtime DB
  editor:                 // Monaco Editor instance
  announcementDuration:   // Duration to hide Cursor tooltip (optional)
  userId:                 // Unique Identifier for current user
  userColor:              // Unique Color Code for current user
  userName:               // Human readable Name or Short Name (optional)
});
```
**Note**: An API documentation will shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We are using [Jest](https://jestjs.io) to form our Unit Test Suite. [Nyc _(formerly known as Istanbul)_](https://istanbul.js.org/) is used for coverage reporting.

To run all the unit test suites in local dev environment, run the following after dependencies have been installed:

```sh
$ yarn test
```

To run unit tests in CI environment, run:

```sh
$ yarn test:ci
```

## Reporting a Bug

Head on to [**Discussion**](https://github.com/Progyan1997/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Contributing

See [Contributing Guidelines](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](LICENSE) for more details.
