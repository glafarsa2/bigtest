# @bigtest/effection-express

## 0.8.0

### Minor Changes

- 837a4630: Remove Mailbox based API from effection-express and use agent handler in server

### Patch Changes

- 804210f6: Upgraded @effection/subscription and applied new chainability

## 0.7.0

### Minor Changes

- 8afb1cee: add ability to consume websockets as a subscription alongside the
  Mailbox based API

### Patch Changes

- 3e95a130: Annotate type declaration of `Socket.send()` as `Operation<void>`
- 83153e3f: Upgrade effection dependencies to latest versions, upgrade to new style of subscriptions

## 0.6.0

### Minor Changes

- d671a894: Better wrapping of middleware as effection context, and exposing underlying raw
  express application.

## 0.5.1

### Patch Changes

- d2d50a5b: upgrade effection

## 0.5.0

### Minor Changes

- 154b93a1: Introduce changesets for simpler release management

### Patch Changes

- 1b7fa0f1: upgrade version of @effection/events to 0.7.1
