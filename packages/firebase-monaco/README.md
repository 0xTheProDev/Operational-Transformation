# `@otjs/fb-monaco`

[![License](https://img.shields.io/badge/license-MIT-yellow)](LICENSE)
[![NPM VERSION](https://img.shields.io/npm/v/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)
[![Node VERSION](https://img.shields.io/node/v/@otjs/firebase-monaco)](https://www.npmjs.com/package/@otjs/firebase-monaco)

## Description

> Real-time collaborative editor with out of the box binding with Firebase and Monaco Editor.

## Installation

To install _@otjs/firebase-monaco_, run:

```sh
$ yarn add @otjs/firebase-monaco
```

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

See [Contributing Guidelines](../.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license,
see [LICENSE](LICENSE) for more details.
