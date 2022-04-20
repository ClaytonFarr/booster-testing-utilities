# Booster Testing Utilities

> ### ⭐️ Heads Up ⭐️
>
> This is currently a work in progress - and opinionated.
>
> I'm sharing it mid-stream in case it can help others work through similar
> questions for testing [Booster](https://framework.booster.cloud/) apps,
> or better understand Booster's currently undocumented
> [built-in testing tool](https://github.com/boostercloud/booster/tree/main/packages/application-tester).
>
> (I think) I'm fairly skilled in creating event-driven applications,
> working with Booster, and creating tools in JS/Typescript, but I'm
> relatively new to writing tests.
>
> Most of this work is based on a common-sense approach but if there
> something critical you think I'm missing in my thinking or approach,
> please let me know.
>
> Currently, I'm sorting the details for -
>
> - the levels and types of testing that make sense (to me) for a
>   Booster/<abbr title='Event Driven Application'>EDA</abbr> app
> - the helper utilities that can help support, standardize, and simplify tests
> - better documentation of everything going on here
>
> I'm doing this next across some real-world projects. My hope is to update
> this repo as I learn what works best in practice.
>
> In the mean-time, please see the notes below for a high-level overview and dig into the
> code examples for specifics.

## Updates

- [Repo updates](https://github.com/ClaytonFarr/booster-testing-utilities#repo-updates) since initial publish

## TL;DR

- Goal is to provide patterns and utilities to more quickly and reliably test Booster apps.
- This repo example is using [Vitest](https://vitest.dev/) for testing, but this can be updated to another testing framework.
- Using Booster's `application-tester` [package](<](https://github.com/boostercloud/booster/tree/main/packages/application-tester).>)
  across all examples to simplify testing.
- Includes [custom updates](https://github.com/ClaytonFarr/booster-testing-utilities/tree/master/test/test-helpers/custom-local-test-helper)
  to Booster's local-infrastructure 'test-helper' package to allow the
  Booster `application-tester` to be used for both local and deployed tests. (The current
  Booster package functionality for local testing is incomplete).
- Includes opinionated [code-examples](https://github.com/ClaytonFarr/booster-testing-utilities/tree/master/test/commands)
  and [helper utilities](https://github.com/ClaytonFarr/booster-testing-utilities/tree/master/test/test-helpers)
  to test [opinionated ideas](https://github.com/ClaytonFarr/booster-testing-utilities#tested-patterns)
  of the expected behavior of an application and the code hygiene of Booster elements
  (e.g. commands, entities, etc.).
- Also includes helper utilities that [abstract test creation](https://github.com/ClaytonFarr/booster-testing-utilities#testing-automation)
  substantially, inferring as much data and intention as possible from the tested files themselves
  via code or special @ notation. _(The jury is still out what level of this is useful (e.g. don't
  want to accidentally create self-fulfilling tests)._

## Test Relevant Files in Repo

_The things you'll want to bring into your own project to replicate this testing approach._

- dependencies and 'test:\*' scripts: `/package.json`
- Booster config setup: `/src/config/config.ts` _(updates to 'local' & 'test' environments)_
- testing framework config: `/vitest.config.ts`
- testing constant references: `/test/constant.ts`
- testing global startup/tear-down: `/test/globalSetup.ts` _(backup/restore datastores for local testing)_
- testing helper utilities: `/test/test-helpers/*` _(utilities to simplify/standardize tests)_
- testing JWT key: `/keys/testing-public.key` _(to decode JWT with application-tester)_
- 'framework-provider-local-infrastructure' custom 'test-helper': `/test/test-helpers/custom-local-test-helper/*`
  _(in-app 'package' override until Booster package completes functionality for local testing)_

## Current Rough & Dirty Notes

### Purpose

- Pull together useful patterns, utilities, and code examples to quickly and
  confidently test [Booster](https://framework.booster.cloud/) applications.

### Getting Started

- Clone repo
- Install dependencies
- Perform steps in _Running Tests: Testing Local Environment_ below
- Take a look at -
  - example [command](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/src/commands/order-snack.ts)
  - example [command test #1](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/commands/order-snack.01-explicit.test.ts), with inline methods that use `application-tester`
  - example [command test #2](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/commands/order-cocktail.02-explicit-with-methods.test.ts), that does same work using helper utilities
  - example [command test #3](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/commands/order-snack.03-inferred-data.test.ts), that uses helper utilities and also infers test data from source file
  - example [command test #4](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/commands/order-snack.04-auto-generated.test.ts), that fully automates test creation via source file @comments and helper utilities

### Application

This application is purposely simple, but complete with common elements like roles,
validation, handler processing, event-handlers, and projected read-models to test.

Sorely lacking some more comprehensive documentation here, but take a peek
at `src/commands/order-snack.ts` and ``src/commands/order-cocktail.ts` to get a feel
for how the application works. (BTW, the funny '@syntax' comments included within
these are part of an idea to
[possibly help automate some tests](https://github.com/ClaytonFarr/booster-testing-utilities#testing-automation) -
jury is still out on whether this makes sense or not).

### Running Tests

**Testing Local Environment**

- in 1st terminal:
  - run `npm run start` to start app server
  - in this terminal, will see output from app server
- once app server running, in 2nd terminal:
  - run `npm run test:local` (or `npm run test:local+ui` to open test UI in browser)
  - in this terminal, will see output from Vitest test runner
  - within this terminal, press `a` to rerun all tests, if wanted

**Testing Deployed Environment (AWS)**

- run `npm run test:live`
  - will deploy test stack to AWS
- if make changes to code
  - in new terminal run `boost deploy -e test`
  - in original terminal (where tests running), press `a` to re-run tests
- when cancel process in original terminal, should nuke deployed test stack

### Testing Tools

- This repo uses [Vitest](https://vitest.dev/) to run tests - but that is not required.
  Vitest has a syntax very similar to Jest or Mocha+Chai, but runs tests more quickly
  and offers features like <abbr title='Hot Module Reloading'>HMR</abbr>. If you'd prefer
  to use Jest or Mocha+Chai, you should be able to utilize most of the patterns and utilities
  with minimal revisions.

- It also utilizes Booster's `application-tester`
  [package](https://github.com/boostercloud/booster/tree/main/packages/application-tester)
  to simplify testing and normalize test code for different environments (e.g. local & AWS).

- It includes a locally linked, customized version of the 'test-helper' from the
  `framework-provider-local-infrastructure` [package](https://github.com/boostercloud/booster/tree/main/packages/framework-provider-local-infrastructure/src/test-helper) with updates to put in in parity
  with the 'test-helper' methods afforded by other provider packages (e.g. AWS).

### Testing Scope

I'm still trying to determine what level of testing is useful/necessary in a Booster application.
E.g True unit testing via executing imported classes? Pseudo-unit testing via testing effects?
Specific integrations testing?

My understanding and appreciation are certainly limited by my current testing experience but
I'm operating on a few assumptions at the moment:

- the Booster framework appears to have good unit/integration testing coverage of its core functionality
- if we can rely on these to ensure the framework is working as intended (e.g. commands processing
  successfully, events reducing into entities, entities projecting into read models, etc.) than the
  job at hand for us is to test:
  - 1. the intended behavior of the application and its processes
  - 2. the code hygiene of the application's parts (i.e. are we following a desired practice like input validation?)
- we can test intended behavior/processes via e2e/functional tests
  - if e2e/functional tests can be created more quickly and reliably, we may not need to create
    (as many) unit tests to confirm the functionality of the individual parts
- we can test code hygiene via pseudo-unit tests

Again, this is definitely an area I'm operating on some shallow knowledge and big assumptions,
but hopeful there is some leverage to be found to help make testing quick and part of the creation
process while still being reliable.

### Tested Patterns

For testing, I'm trying to think backward from the responsibility and/or expected effect(s)
of each element in the system to determine what assertions and expectations are necessary.
The goal is to sort out what's the least we can get away with testing (above and beyond  
the framework testing that's already occurring) to confirm expected functionality and behavior.

- ✅ = example and utility added
- ⏩ = will likely be derivative of an existing example/utility
- 🚧 = working on this currently
- 🤔 = not certain yet if this is needed; may be accounted for in Booster framework infrastructure tests

**A Process**

_Note: 'process' in this context is something that can be initiated by an actor (command) or on a schedule (scheduled-command), may have 0 or more event-handlers to perform its work, and results in some expected change in the system (i.e. a request and activity that may span more than a single handler)._

- 🚧 should perform correct authorization OR correct schedule
- 🚧 should accept specific parameter(s)
- 🚧 should perform certain work
- 🚧 should save specific data to entity(ies)
- 🚧 may make specific data visible for entity(ies)

**A Command**

_Note: finished building out items below and currently re-evaluating which of these are relevant to asserting/testing expected behavior or code hygiene vs. testing the reliability of framework._

- ✅ should perform correct authorization
- ✅ 🤔 should accept specific parameter(s)
- ✅ should fail when required parameters are missing
- ✅ should succeed if submitting only required parameter(s)
- ✅ should fail if parameters values are empty ('')
- ✅ 🤔 should fail if parameters are invalid type
- ✅ should perform certain work
- ✅ should register specific event(s)
- ? should be able to receive same command repeatedly or specific number of times

**A Scheduled Command**

- should be called at specific time(s)
- ⏩ should accept specific parameter(s)
- ⏩ should fail when required parameters are missing
- ⏩ should succeed if submitting only required parameter(s)
- ⏩ should fail if parameters values are empty ('')
- ⏩ should fail if parameters are invalid type
- ⏩ should perform certain work
- ⏩ should register specific event(s)
- ref: https://github.com/boostercloud/booster/blob/main/packages/framework-integration-tests/integration/provider-unaware/functionality/scheduled-commands.integration.ts

**An Event Handler**

- should be called when a specific event is emitted
- ⏩ should accept specific parameter(s)
- ⏩ should fail when required parameters are missing
- ⏩ should succeed if submitting only required parameter(s)
- ⏩ should fail if parameters values are empty ('')
- ⏩ should fail if parameters are invalid type
- ⏩ should perform certain work
- ⏩ should register specific event(s)
- should be able to receive same event without duplicating work
- should be able to process events out of order

**An Event**

- should have specific parameter(s)
- ? should update specific entity(ies)

**An Entity**

- should have specific parameter(s)
- should reduce specific event(s)
- ? may update specific read model(s)
- ref: https://github.com/boostercloud/booster/blob/6448db061ba7d11bd91bbd6525e4b646fb8205a9/packages/framework-provider-local/test/helpers/event-helper.ts

**A Read Model**

- ⏩ should perform correct authorization
- ⏩ should accept specific parameter(s)
- should project specific entity(ies)
- should project entity's public data
- should NOT project entity's private data
- ref: https://github.com/boostercloud/booster/blob/6448db061ba7d11bd91bbd6525e4b646fb8205a9/packages/framework-provider-local/test/helpers/read-model-helper.ts

### Testing Utilities

Included are a number of helper utilities to help simplify and standardize tests.
These are still maturing, and range from
[generic utilities](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/test-helpers/helper-filesystem.ts)
to [test-specific utilities](https://github.com/ClaytonFarr/booster-testing-utilities/blob/master/test/test-helpers/helper-commands.ts).

#### Testing Automation

_Note: some helper utilities abstract the test creation substantially (e.g. within 'helpers-command.ts') and attempt to infer as much data as possible from the tested files themselves. Jury is still out what level of this is useful (e.g. don't want to accidentally create self-fulfilling tests)._

`@syntax` is optional for test automation.

**Command: Event keys**

- must be first arguments in event constructor
- must be in this order:
  - `@requiredInputs`: input variables required to trigger event
  - `@aReducingEntity`: an entity that will be updated by event (required to lookup event in datastore)

**Command: Work keys (@work00)**

- can be any where in document
- can include any unique (within document) two-digit key
- require:
  - `@work00`: brief description of work to be done
  - `@work00-inputs`: input name and value (e.g. { fruit: 'apple', drink: string })
    - can use explicit value or generic (e.g. string, number, boolean, id) to generate fake values
  - `@work01-entity`: an entity that will be updated by event (required to lookup event snapshot in datastore)
  - `@work01-shouldHave`: value to test if work was done
    - can be `true` or `false` if want to test yes/no of work done
    - can be a string to test work result value

## Repo Updates

_Pseudo-changelog of updates to repo since initial publish - helpful if you cloned an earlier version and want to check what's new._

**04-20-22**

- Added `start:testing` script and comment to package.json to utilize MODE=test variable for Vitest tests.
- Changed `@work00-result` syntax to `@work00-shouldHave`
- Normalized input format/syntax for command inputs and work-to-be-done inputs
- Updated `test-helpers/helper-command`
  - update `getRegisteredEvents` utility regex to better match various code patterns.
  - update `getWorkToBeDone` utility to use '-shouldHave' syntax
  - add `getWorkToBeDone` errors if a @work comment set is incomplete
  - update `wasWorkDone` utility to search across nested record data for '-shouldHave' value
  - relabel 'parameter' to 'input' across utilities and automation @syntax
- Updated `custom-local-test-helper/local-queries`
  - filter results by kind ('event' v 'snapshot')
