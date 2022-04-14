# Booster Testing

- [x] note expected fake app behavior
- [x] test fake app is working as intended
- [x] get 1st integration test in working state
- [x] clean up organization of helper functions
- [x] re-review references for additional techniques/ideas
- [x] check if any parts of test helpers are no longer needed

- [ ] note expectations for each element / integration
- [ ] create test example for each type of integration
- [ ] attempt to abstract test patterns into reusable functions

- [ ] make test work in AWS deployed environment (seems like deployed graphql server is not working)
- [ ] create 2nd integration test
- [ ] sort out how to make these tests show up in coverage report
- [ ] check if test updates can fire vitest HMR

_References_

- https://github.com/boostercloud/booster/tree/main/packages/framework-integration-tests/integration/provider-unaware/functionality
- https://github.com/boostercloud/booster/tree/6448db061ba7d11bd91bbd6525e4b646fb8205a9/packages/framework-provider-local/test
- https://github.com/boostercloud/booster/tree/main/packages/framework-core/test
- https://github.com/boostercloud/booster/blob/main/.vscode/launch.json#L8-L29

- https://www.npmjs.com/package/patch-package

# Test Patterns

**Commands**

- should accept specific parameters(s)
- should fail if missing required parameters(s)
- should fail with invalid argument(s)
- should perform certain work
- should register specific event(s)
- integrations / side effects:
  - registered event(s) should update specific entity(ies)
  - registered event(s) data may update specific read model(s)

**Scheduled Commands**

- xxx

**Event Handlers**

- xxx

**Events**

- xxx

**Entities**

- xxx

**Read Models**

- should update read model with projected entity snapshot data

# Testing Notes

- when testing live
  - run `npm run test:live`
    - will deploy test stack to AWS
  - if make changes to code
    - in new terminal run `boost deploy -e test`
    - in original terminal (where tests running), press `a` to re-run tests
  - when cancel process in original terminal, should nuke deployed test stack

## Expected Behavior

- calling `CommandOne` should -

  - expect a single string argument of 'paramOne'
  - transform 'paramOne' to uppercase
  - transform 'paramOne' to excited (append '!!!')
  - register `EventOne`
    - with uppercase arg for 'attrOne'
      - reduce uppercase arg into 'attrOne' of `EntityOne`
        - project uppercase arg into 'attrOne' of `EntityOneReadModel`
  - register `EventTwo`
    - with excited arg for 'attrOne'
    - with either 'deactivate' or undefined for 'attrTwo'
      - reduce excited arg into 'attrOne' of `EntityTwo`
      - reduce 'deactivate'|undefined into 'attrTwo' of `EntityTwo`
      - reduce true|false into 'attrThree' of `EntityTwo`
        - project excited arg into 'attrOne' of `EntityTwoReadModel`
        - NOT project 'attrTwo' or 'attrThree' into `EntityTwoReadModel`
      - call `EventHandlerOne`, which will
        - transform excited arg to reverse
        - register `EventThree`
          - with excited+reverse arg for 'attrOne'
            - reduce excited arg into 'attrTwo' of `EntityOne`
              - project excited arg into 'attrTwo' of `EntityOneReadModel`

- if call `CommandOne` with 'apple' value for 'paramOne'

  - create 1 `EntityOne` item whose attributes should be
    - attrOne: 'APPLE'
    - attrTwo: '!!!elppa'
  - create 1 `EntityOneReadModel` item whose attributes should be
    - attrOne: 'APPLE'
    - attrTwo: '!!!elppa'
  - create 1 `EntityTwo` item whose attributes should be
    - attrOne: 'apple!!!'
    - attrTwo: undefined
    - active: true
  - create 1 `EntityTwoReadModel` item whose attributes should be
    - attrOne: 'apple!!!'

- if call `CommandOne` with 'leave' value for 'paramOne'

  - create 1 `EntityOne` item whose attributes should be
    - attrOne: 'LEAVE'
    - attrTwo: '!!!evael'
  - create 1 `EntityOneReadModel` item whose attributes should be
    - attrOne: 'LEAVE'
    - attrTwo: '!!!evael'
  - create 1 `EntityTwo` item whose attributes should be
    - attrOne: 'leave!!!'
    - attrTwo: 'deactivate'
    - active: false
  - create 1 `EntityTwoReadModel` item whose attributes should be
    - attrOne: 'leave!!!'

