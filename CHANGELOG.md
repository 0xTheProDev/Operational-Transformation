# CHANGELOG

<!--
Read this section if it's your first time writing changelog, if not read anyway.

Guidelines:
- Don't dump commit log diffs as changelogs. Bad idea, it is.
- Changelogs are for humans, not machines.
- There should be an entry for every single version.
- The same types of changes should be grouped.
- the latest version comes first.

Tags:
- Added: for new features.
- Changed: for changes in existing functionality.
- Deprecated: for soon-to-be removed features.
- Removed: for now removed features.
- Fixed: for any bug fixes.
- Security: in case of vulnerabilities.
- Documentation: in case of documentation update.

Good to have: commit or PR links.

-->

## [v0.2.0](https://github.com/Progyan1997/Operational-Transformation/tree/v0.2.0)

### Added

- Add package `@otjs/firebase-plaintext` that implements Database Adapter interface for Plain Text Editor using Firebase Realtime Database as source of truth. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/5) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/23)
- Add package `@otjs/ace` that implements Editor Adapter interface for Plain Text Editor using Ace Editor instance as presentation. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/46) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/59)
- Add package `@otjs/monaco` that implements Editor Adapter interface for Plain Text Editor using Monaco Editor instance as presentation. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/6) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/27)
- Add package `@otjs/firebase-monaco` that integrates Firebase and Monaco adapter out of the box to create standalone package ready to be used. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/36) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/37)
- Add Cursor Widget in Ace Adapter to hightlight User Name beside cursor whenever a change is being made. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/76) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/81)
- Add Cursor Widget in Monaco Adapter to hightlight User Name beside cursor whenever a change is being made. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/29) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/40)
- Add Integration Test suite for `@otjs/ace`. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/77) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/85)

### Changed

- Rename package scope to `@otjs/*`. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/33) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/34)
- Update `@otjs/firebase-ace` with API for User Name announcement. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/83) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/84)

### Fixed

- Classname for Remote Cursor or Selection for Ace Editor. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/60) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/75)
- Classname for Remote Cursor or Selection for Monaco Editor. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/61) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/62)
- Missing testcase for `@otjs/ace` Integration Test suite. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/88) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/89)

### Security

- Bump tmpl from 1.0.4 to 1.0.5 [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/41)

### Documentation

- Add LICENSE Information to root README. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/14) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/20)
- Integrated Codecov.io to track progress over Test workflow. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/3) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/24)
- Add Bug Reporting instructions to each package documentation. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/18) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/31)
- Update root README along with Version & Dependency matrix for all packages. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/4) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/39)
- Update documentation in each package. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/2) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/44)
- Add Code of Conduct for the community guidelines. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/54) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/56)
- Add Contributing Guidelines for the community engagement. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/55) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/57)
- Fix hyperlinks in Contributing Guidelines. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/64) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/65)
- Add Security Guidelines to report vulnerabilities. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/52) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/80)
- Add Issue and Pull Request guidelines for the community engagement. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/53) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/86)
- Add README for example use-case of `@otjs/*` packages as Realtime Collaborative Editor. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/67) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/71)

## [v0.1.1](https://github.com/Progyan1997/Operational-Transformation/tree/v0.1.1)

### Fixed

- Enable usage of the library in both Web (Browsers) and Node. Change `library.globalObject` to use `this` in Webpack Config. [Tracker](https://github.com/Progyan1997/Operational-Transformation/issues/21) [Work Log](https://github.com/Progyan1997/Operational-Transformation/pull/22)

## [v0.1.0](https://github.com/Progyan1997/Operational-Transformation/tree/v0.1.0)

### Added

- Add package `@operational-transformation/plaintext` that Handles Trannsformation Logic related to Plain Text content and content changes.
- Add package `@operational-transformation/plaintext-editor` that Handles integration between a Plain Text Editor and a Central Server, and keeps contents of all Plain Text Editors associated with the Central Server in sync via Plain Text Operational Transformations.
- Add package `@operational-transformation/state-machine` that Handles State Transitions and Side Effects in each stages of Synchronization between Client (e.g., Editor) and Server.
