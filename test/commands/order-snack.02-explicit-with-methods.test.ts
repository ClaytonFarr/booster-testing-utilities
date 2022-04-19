import { describe } from 'vitest'
import { applicationUnderTest, unAuthGraphQLclient, authGraphQLclient } from '../test-helpers'
import * as helpers from '../test-helpers'

// Test
// =================================================================================================
const commandName = 'OrderSnack'

describe(`[Explicit Data + Helper Methods] ${helpers.pascalToTitleCase(commandName)} Command`, async () => {
  // Define Test Data
  // -----------------------------------------------------------------------------------------------
  const authorizedRoles = ['all'] // optional auth roles (if 'all' or empty array, auth not tested)
  const acceptedParameters: helpers.Parameter[] = [
    { name: 'fruit', type: 'String', required: true },
    { name: 'drink', type: 'String', validExample: 'water' },
    { name: 'id', type: 'ID' },
  ]
  const registeredEvents: helpers.RegisteredEvent[] = [
    // event, the command input required to register it, and one of events reducing entities (to evaluate result)
    { input: { fruit: 'apple' }, event: 'FruitOrdered', evaluatedEntity: 'Fruit' },
    { input: { fruit: 'pear', drink: 'water' }, event: 'DrinkOrdered', evaluatedEntity: 'Drink' },
    { input: { fruit: 'candy' }, event: 'CandyOrdered', evaluatedEntity: 'Tattle' },
  ]
  const workToBeDone: helpers.WorkToBeDone[] = [
    {
      workToDo: "capitalize the 'fruit' value",
      // command input that should trigger the work (currently only one input is supported by test method below)
      testInputParameter: {
        name: 'fruit',
        value: 'apple',
      },
      // entity to evaluate work done
      evaluatedEntity: 'Fruit',
      // expected result if work done (currently presumes entity field name matches input parameter name)
      expectedResult: 'Apple',
    },
    {
      workToDo: 'tattle when candy is ordered',
      testInputParameter: {
        name: 'fruit',
        value: 'candy',
      },
      evaluatedEntity: 'Tattle',
      expectedResult: true,
    },
  ]

  // Create Test Resources
  // -----------------------------------------------------------------------------------------------
  const graphQLclient = authorizedRoles[0] === 'all' ? unAuthGraphQLclient : authGraphQLclient(authorizedRoles[0])
  const acceptedParameterNames = helpers.getAcceptedParameterNames(acceptedParameters)
  const allVariables = helpers.createAllVariables(acceptedParameters)
  const requiredVariables = helpers.createRequiredVariables(acceptedParameters)
  const emptyVariables = helpers.createEmptyVariables(acceptedParameters)
  const invalidDataTypeVariables = helpers.createInvalidDataTypeVariables(acceptedParameters)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedParameters)

  // TESTS
  // -----------------------------------------------------------------------------------------------

  // It should perform correct AUTHORIZATION
  if (authorizedRoles[0] !== 'all') helpers.createRolesTests(authorizedRoles, commandMutation, requiredVariables)

  // It should accept ALL PARAMETERS
  helpers.createAcceptAllParametersTest(commandMutation, allVariables, acceptedParameterNames, graphQLclient)

  // It should fail if MISSING REQUIRED input(s)
  if (acceptedParameters.filter((param) => param.required).length > 0)
    helpers.createMissingRequiredInputTest(commandMutation, graphQLclient)

  // It should succeed with ONLY REQUIRED input(s)
  if (acceptedParameters.filter((param) => param.required).length > 0)
    helpers.createSubmitOnlyRequiredInputsTest(commandMutation, requiredVariables, graphQLclient)

  // It should reject EMPTY inputs
  helpers.createRejectEmptyInputsTest(commandMutation, emptyVariables, graphQLclient)

  // It should reject INVALID data types
  helpers.createRejectInvalidInputTypesTest(commandMutation, invalidDataTypeVariables, graphQLclient)

  // It should possibly do specific WORK
  if (workToBeDone.length > 0)
    helpers.createWorkToBeDoneTests(workToBeDone, commandMutation, applicationUnderTest, graphQLclient)

  // It should register specific EVENTS
  helpers.createRegisteredEventsTests(registeredEvents, commandMutation, applicationUnderTest, graphQLclient)
})
