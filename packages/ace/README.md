<!-- markdownlint-configure-file { "MD033": false, "MD045" : false } -->

# `@otjs/ace`

[![Sponsor](https://img.shields.io/badge/sponsor-30363D?style=for-the-badge&logo=GitHub-Sponsors&logoColor=#white)](https://github.com/sponsors/0xTheProDev)
[![Npm Version](https://img.shields.io/npm/v/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![Weekly Downloads](https://img.shields.io/npm/dw/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![Minified Zipped Size](https://img.shields.io/bundlephobia/minzip/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![Code Coverage](https://img.shields.io/codecov/c/github/0xTheProDev/Operational-Transformation?style=for-the-badge&token=R0T5YH3XX3)](https://codecov.io/github/0xTheProDev/Operational-Transformation)
[![Types](https://img.shields.io/npm/types/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![License](https://img.shields.io/npm/l/@otjs/ace?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/ace/LICENSE)
[![Dependencies](https://img.shields.io/librariesio/release/npm/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![Dependents](https://img.shields.io/librariesio/dependents/npm/@otjs/ace?style=for-the-badge)](https://www.npmjs.com/package/@otjs/ace)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/@otjs/ace?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/SECURITY.md)
[![Stars](https://img.shields.io/github/stars/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/stargazers)
[![Forks](https://img.shields.io/github/forks/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/network/members)
[![Discussions](https://img.shields.io/github/discussions/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/discussions)

## Description

> Editor Adapter implementation for Ace.

## Installation

- To install using [Pnpm](https://pnpm.io) _(recommended)_:

  ```sh
  pnpm add @otjs/ace
  ```

- To install using [Yarn](https://yarnpkg.com):

  ```sh
  yarn add @otjs/ace
  ```

- To install using [Npm](https://www.npmjs.com):

  ```sh
  npm i @otjs/ace --save
  ```

### Peer Dependencies

Make sure to install all the peer dependencies beforehand:

[![Ace Editor](https://img.shields.io/npm/dependency-version/@otjs/ace/peer/ace-builds?style=for-the-badge)](https://ace.c9.io)

## Usage

---

```ts
import { AceAdapter } from "@otjs/ace";

const aceAdapter = new AceAdapter({
  editor:                   // Ace Editor Instance
  announcementDuration:     // Duration (in ms) of User Name Announcement beside Cursor (optional)
  bindEvents:               // Boolean on whether or not to emit events from Adapter (optional)
});
```

**Note**: An API documentation will be shipped along with the package. This will power intellisense in the editor of your choice.

## Testing

We don't have any Unit Test Suite for `@otjs/ace`. Please refer to root [README](https://github.com/0xTheProDev/Operational-Transformation/blob/main/README.md) for details regarding Integration Test Suite that concerns ace.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](https://github.com/0xTheProDev/Operational-Transformation/blob/main/CHANGELOG.md) for more details on what has been changed in the latest release.

## Contributing

See [Contributing Guidelines](https://github.com/0xTheProDev/Operational-Transformation/blob/main/.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license, see [LICENSE](https://github.com/0xTheProDev/Operational-Transformation/blob/main/packages/ace/LICENSE) for more details.

<a href="https://github.com/0xTheProDev">
  <img src=".github/images/the-pro-dev-original.png" alt="The Pro Dev" height="120" width="120"/>
</a>
