# `@otjs/firebase-ace`

[![Npm Version](https://img.shields.io/npm/v/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Minified Size](https://img.shields.io/bundlephobia/min/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Types](https://img.shields.io/npm/types/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![License](https://img.shields.io/npm/l/@otjs/firebase-ace)](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/firebase-ace/LICENSE)
[![Quality](https://img.shields.io/npms-io/quality-score/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Maintainance](https://img.shields.io/npms-io/maintenance-score/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/firebase-ace)](https://www.npmjs.com/package/@otjs/firebase-ace)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/firebase-ace)](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Discussions](https://img.shields.io/github/discussions/Progyan1997/Operational-Transformation)](https://github.com/Progyan1997/Operational-Transformation/discussions)

## Description

> Real-time collaborative editor with out of the box binding with Firebase and Ace Editor.

## Installation

- To install using [Yarn](https://yarnpkg.com) _(recommended)_:

```sh
$ yarn add @otjs/firebase-ace
```

- To install using [Npm](https://www.npmjs.com):

```sh
$ npm i @otjs/firebase-ace
```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![Ace Editor](https://img.shields.io/npm/v/ace-build?label=ace)](https://ace.c9.io)
[![Firebase](https://img.shields.io/npm/dependency-version/@otjs/firebase-ace/peer/firebase)](https://www.npmjs.com/package/firebase)

## Usage

```ts
import { FireAceEditor } from "@otjs/firebase-ace";

const fireAce = new FireAceEditor({
  databaseRef:            // Database Reference in Firebase Realtime DB
  editor:                 // Monaco Editor instance
  userId:                 // Unique Identifier for current user
  userColor:              // Unique Color Code for current user
  userName:               // Human readable Name or Short Name (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We are using [Jest](https://jestjs.io) to form our Unit Test Suite. [Nyc _(formerly known as Istanbul)_](https://istanbul.js.org/) is used for coverage reporting.

To run all the unit test suites in local dev environment, run the following after dependencies have been installed:

```sh
$ yarn test
```

## Reporting a Bug

Head on to [**Discussion**](https://github.com/Progyan1997/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/Progyan1997/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Contributing

See [Contributing Guidelines](https://github.com/Progyan1997/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/Progyan1997/Operational-Transformation/blob/main/packages/firebase-ace/LICENSE) for more details.
