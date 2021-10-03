# `@otjs/firebase-plaintext`

[![Npm Version](https://img.shields.io/npm/v/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Node Version](https://img.shields.io/node/v/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Types](https://img.shields.io/npm/types/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![License](https://img.shields.io/npm/l/@otjs/firebase-plaintext)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/firebase-plaintext/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/firebase-plaintext)](https://www.npmjs.com/package/@otjs/firebase-plaintext)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/firebase-plaintext)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> Database Adapter implementation for Firebase.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/firebase-plaintext
```

- To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/firebase-plaintext
```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![PlainText](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/@otjs/plaintext)](https://www.npmjs.com/package/@otjs/plaintext)
[![PlainText Editor](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/@otjs/plaintext-editor)](https://www.npmjs.com/package/@otjs/plaintext-editor)
[![Firebase](https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/firebase)](https://www.npmjs.com/package/firebase)

## Usage

```ts
import { FirebaseAdapter } from "@otjs/firebase-plaintext";

const firebaseAdapter = new FirebaseAdapter({
  databaseRef:  // Database Reference in Firebase Realtime DB
  userId:       // Unique Identifier for current user
  userColor:    // Unique Color Code for current user
  userName:     // Human readable Name or Short Name (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/firebase-plaintext`. Please refer to root [README](https://github.com/Progyan1997/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns firebase.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/Progyan1997/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/Progyan1997/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/firebase-plaintext/LICENSE) for more details.
