# Booster Testing

- [x] note expected fake app behavior
- [x] test fake app is working as intended
- [x] get 1st integration test in working state
- [x] clean up organization of helper functions
- [x] re-review references for additional techniques/ideas
- [x] check if any parts of test helpers are no longer needed
- [x] make test work in AWS deployed environment
- [x] check if test updates can fire vitest HMR
- [x] abstract test patterns into reusable functions
- [x] create 2nd integration test
- [x] note expectations for each element
- [x] check tests in AWS environment
- [x] note expectations / effects for a process

- [ ] draft public readme
- [ ] create test example for each type of element
- [ ] review unit test examples: https://github.com/boostercloud/booster/tree/main/packages/framework-core/test
- [ ] sort out how to make tests show up in coverage report

_Notes_

- leaning on Booster framework tests for core functionality coverage (e.g. commands processing successfully, events reducing into entities, entities projecting into read models, etc.)

# Test Patterns

**A Process**

- should perform correct authorization OR correct schedule
- should accept specific parameter(s)
- should perform certain work
- should save specific data to entity(ies)
- may make specific data visible for entity(ies)

**A Command**

- ✅ should perform correct authorization
- ✅ should accept specific parameter(s)
- ✅ should fail when required parameters are missing
- ✅ should succeed if submitting only required parameter(s)
- ✅ should fail if parameters values are empty ('')
- ✅ should fail if parameters are invalid type
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

## Testing Notes

- when testing live
  - run `npm run test:live`
    - will deploy test stack to AWS
  - if make changes to code
    - in new terminal run `boost deploy -e test`
    - in original terminal (where tests running), press `a` to re-run tests
  - when cancel process in original terminal, should nuke deployed test stack

## Testing Automation Notes

@syntax is optional for test automation.

**Command: Event keys**

- must be first arguments in event constructor
- must be in this order:
  - @requiredInput: input variables required to trigger event
  - @aReducingEntity: an entity that will be updated by event (required to lookup event in datastore)

**Command: Work keys (@work00)**

- can be any where in document
- can include any unique (within document) two-digit key
- require:
  - @work00: brief description of work to be done
  - @work00-inputs: input name and value (e.g. { name: 'fruit', value: 'apple' })
    - currently presumes work can be triggered by single input parameter
  - @work01-entity: an entity that will be updated by event (required to lookup event in datastore)
  - @work01-result: value to test if work was done
    - can be `true` or `false` if want to test yes/no of work done
    - can be a string to test work result value
      - currently presumes result value exists on field with same name as @work00-inputs `name`
