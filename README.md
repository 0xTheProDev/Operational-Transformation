# Operational Transformation

<p align="center">
  <a href="https://en.wikipedia.org/wiki/Operational_transformation" target="_blank">
    <img src=".github/images/otjs-logo.png" alt="@otjs" />
  </a>
</p>

---

[![Build](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/build.yml/badge.svg)](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/build.yml)
[![Tests](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/tests.yml/badge.svg)](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/tests.yml)
[![Deployment](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/deploy.yml/badge.svg?branch=v0.2.1)](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/deploy.yml)
[![Code Quality](https://github.com/0xTheProDev/Operational-Transformation/actions/workflows/quality.yml/badge.svg)](https://github.com/0xTheProDev/Operational-Transformation/security/code-scanning)
[![Code Coverage](https://codecov.io/gh/0xTheProDev/Operational-Transformation/branch/main/graph/badge.svg?token=R0T5YH3XX3)](https://codecov.io/gh/0xTheProDev/Operational-Transformation)

[![Version](https://img.shields.io/github/lerna-json/v/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://lerna.js.org)
[![Built With](https://img.shields.io/badge/built%20with-webpack-green?style=for-the-badge)](https://webpack.js.org)
[![Tested With](https://img.shields.io/badge/tested%20with-jest-yellowgreen?style=for-the-badge)](https://jestjs.io)
[![Typed With](https://img.shields.io/badge/typed%20with-TypeScript-blue?style=for-the-badge)](https://www.typescriptlang.org)
[![Styled With](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=for-the-badge&label=styled%20with)](https://prettier.io)
[![License](https://img.shields.io/badge/license-MIT-yellow?style=for-the-badge)](LICENSE)
[![Open Issues](https://img.shields.io/github/issues-raw/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/issues)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/issues?q=is%3Aissue+is%3Aclosed)
[![Open Pulls](https://img.shields.io/github/issues-pr-raw/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/pulls)
[![Closed Pulls](https://img.shields.io/github/issues-pr-closed-raw/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/pulls?q=is%3Apr+is%3Aclosed)
[![Contributors](https://img.shields.io/github/contributors/0xTheProDev/Operational-Transformation?style=for-the-badge)](https://github.com/0xTheProDev/Operational-Transformation/graphs/contributors)
[![Activity](https://img.shields.io/github/last-commit/0xTheProDev/Operational-Transformation?style=for-the-badge&label=most%20recent%20activity)](https://github.com/0xTheProDev/Operational-Transformation/pulse)

## Description

> Collection of Operation Transformation Algorithms and their respective clients to integrate with any existing system.

<table>
  <thead>
    <tr>
      <th>Package</th>
      <th>Version</th>
      <th>Downloads</th>
      <th>Third-party Dependency</th>
    </tr>
  </thead>
  <tbody>
    <tr title="ace">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/ace">ace</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/ace" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/ace?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/ace" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/ace?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/ace-builds" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/ace/peer/ace-builds?style=for-the-badge"/></a></td>
    </tr>
    <tr title="firebase-ace">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/firebase-ace">firebase-ace</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-ace" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/firebase-ace?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-ace" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/firebase-ace?style=for-the-badge"/></a></td>
      <td>
        <a href="https://www.npmjs.com/package/ace-builds" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/firebase-ace/peer/ace-builds?style=for-the-badge"/></a>
        <a href="https://www.npmjs.com/package/firebase" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/firebase-ace/peer/firebase?style=for-the-badge"/></a>
      </td>
    </tr>
    <tr title="firebase-monaco">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/firebase-monaco">firebase-monaco</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-monaco" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/firebase-monaco?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-monaco" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/firebase-monaco?style=for-the-badge"/></a></td>
      <td>
        <a href="https://www.npmjs.com/package/firebase" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/firebase?style=for-the-badge"/></a>
        <a href="https://www.npmjs.com/package/monaco-editor" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/firebase-monaco/peer/monaco-editor?style=for-the-badge"/></a>
      </td>
    </tr>
    <tr title="firebase-plaintext">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/firebase-plaintext">firebase-plaintext</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-plaintext" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/firebase-plaintext?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/firebase-plaintext" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/firebase-plaintext?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/firebase"><img src="https://img.shields.io/npm/dependency-version/@otjs/firebase-plaintext/peer/firebase?style=for-the-badge"/></a></td>
    </tr>
    <tr title="monaco">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/monaco">monaco</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/monaco" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/monaco?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/monaco" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/monaco?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/monaco-editor" target="_blank"><img src="https://img.shields.io/npm/dependency-version/@otjs/monaco/peer/monaco-editor?style=for-the-badge"/></a></td>
    </tr>
    <tr title="plaintext">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/plaintext">plaintext</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/plaintext" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/plaintext?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/plaintext" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/plaintext?style=for-the-badge"/></a></td>
      <td>-</td>
    </tr>
    <tr title="plaintext-editor">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/plaintext-editor">plaintext-editor</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/plaintext-editor" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/plaintext-editor?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/plaintext-editor" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/plaintext-editor?style=for-the-badge"/></a></td>
      <td>-</td>
    </tr>
    <tr title="state-machine">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/state-machine">state-machine</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/state-machine" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/state-machine?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/state-machine" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/state-machine?style=for-the-badge"/></a></td>
      <td>-</td>
    </tr>
    <tr title="supabase-plaintext">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/supabase-plaintext">supabase-plaintext</a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/supabase-plaintext" target="_blank"><img src="https://img.shields.io/npm/v/@otjs/supabase-plaintext?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/@otjs/supabase-plaintext" target="_blank"><img src="https://img.shields.io/npm/dm/@otjs/supabase-plaintext?style=for-the-badge"/></a></td>
      <td><a href="https://www.npmjs.com/package/supabase"><img src="https://img.shields.io/npm/dependency-version/@otjs/supabase-plaintext/peer/@supabase/supabase-js?style=for-the-badge"/></a></td>
    </tr>
    <tr title="types">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/types">types</a></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
    <tr title="utils">
      <td><a href="https://github.com/0xTheProDev/Operational-Transformation/tree/main/packages/utils">utils</a></td>
      <td>-</td>
      <td>-</td>
      <td>-</td>
    </tr>
  </tbody>
</table>

## Installation

This repository uses monorepo architecture for hosting packages. We are using [Lerna](https://lerna.js.org) to manage workspaces and publishing of individual packages, where as [Yarn](https://yarnpkg.com) is used as package manager to symlink and install 3rd Party Dependencies.

- To install using Lerna _(recommended)_:

  ```sh
  $ lerna bootstrap
  ```

- To install using Yarn:

  ```sh
  $ yarn
  ```

## Testing

We are using [Jest](https://jestjs.io) extensively to form our Unit Test Suite as well as Integration Test Suites, along with test environment, stubs and test runner. [Nyc _(formerly known as Istanbul)_](https://istanbul.js.org/) is used for coverage reporting.

- To run all the unit test suites in local dev environment, run the following after dependencies have been installed:

  ```sh
  $ yarn test
  ```

- To run unit tests in CI environment, run:

  ```sh
  $ yarn test:ci
  ```

- To run integration tests in CI environment, run:

  ```sh
  $ yarn test:firebase
  $ yarn test:monaco
  ```

- To merge all the individual code coverage report and generate final test coverage report, run:

  ```sh
  $ yarn coverage
  ```

- To convert generated final coverage report into more human readable form _(such as **lcov**)_, run:

  ```sh
  $ yarn coverage:dev
  ```

### Integration Tests

This package only provides a functional layer on top of your existing dependencies and does not ship any additional bundle. To make sure our implementation and integrations are up-to-date, we have a comprehensive set of Integration Test Suite living in [**tests**](./__tests__) directory.

### Editor Integration

Most of the popular editors and IDEs have extensions to help with Code Coverage details. These tools often read `lcov` reports and not `json` format. So one must convert them into `lcov` using last command described above to make it work with the editor of their choice.

### Metrics and Tracking

We are using [codecov.io](https://about.codecov.io) to track progress over Code Coverage and [CodeQL](https://codeql.github.com) for Code Quality Analysis.

## Reporting a Bug

Head on to [**Discussion**](https://github.com/0xTheProDev/Operational-Transformation/discussions) section to report a bug or to ask for any feature. Use this [template](https://github.com/0xTheProDev/Operational-Transformation/discussions/30) to make it structural and helpful for the maintainer and the contributors. Feel to add your queries about using this library as well under _Q & A_ section of it. Remember, do not create any Issues by yourself, maintainers of this repository will open one if deemed necessary.

## Changelog

See [CHANGELOG](CHANGELOG.md) for more details.

## Contributing

See [Contributing Guidelines](.github/CONTRIBUTING.md).

## License

This project is licensed under the terms of the MIT license,
see [LICENSE](LICENSE) for more details.
