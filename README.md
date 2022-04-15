# Booster Testing

- [x] note expected fake app behavior
- [x] test fake app is working as intended
- [x] get 1st integration test in working state
- [x] clean up organization of helper functions
- [x] re-review references for additional techniques/ideas
- [x] check if any parts of test helpers are no longer needed
- [x] make test work in AWS deployed environment
- [x] check if test updates can fire vitest HMR

- [ ] note expectations for each element / integration
- [ ] create test example for each type of integration
- [ ] attempt to abstract test patterns into reusable functions

- [ ] create 2nd integration test
- [ ] sort out how to make these tests show up in coverage report

_References_

- https://github.com/boostercloud/booster/tree/main/packages/framework-integration-tests/integration/provider-unaware/functionality
- https://github.com/boostercloud/booster/tree/6448db061ba7d11bd91bbd6525e4b646fb8205a9/packages/framework-provider-local/test
- https://github.com/boostercloud/booster/tree/main/packages/framework-core/test

- leaning on Booster framework tests for core functionality coverage (e.g. commands processing successfully, events reducing into entities, entities projecting into read models, etc.)

# Test Patterns

**A Command**

- ✅ should accept specific parameters(s)
- ✅ should fail when required parameters are missing
- ✅ should succeed if submitting only required parameter(s)
- ✅ should fail if parameters values are empty ('')
- ✅ should fail if parameters are invalid type
- ✅ should register specific event(s)
- ✅ should perform certain work
- 🚧 should fail if request not authorized

**A Scheduled Command**

- xxx

**An Event Handler**

- xxx

**An Event**

- should update specific entity(ies)

**An Entity**

- may update specific read model(s)

**A Read Model**

- should project specific entity data

# Testing Notes

- when testing live
  - run `npm run test:live`
    - will deploy test stack to AWS
  - if make changes to code
    - in new terminal run `boost deploy -e test`
    - in original terminal (where tests running), press `a` to re-run tests
  - when cancel process in original terminal, should nuke deployed test stack
