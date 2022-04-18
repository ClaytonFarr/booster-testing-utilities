import { describe } from 'vitest'
import { applicationUnderTest, unAuthGraphQLclient, authGraphQLclient } from '../test-helpers'
import * as helpers from '../test-helpers'

// Test
// =================================================================================================
const commandName = 'OrderCocktail'

describe(`[Inferred Data + Helper Methods] ${helpers.pascalToTitleCase(commandName)} Command`, async () => {
  // Define Test Data
  // -----------------------------------------------------------------------------------------------
  const authorizedRoles = ['Mom', 'Dad'] // optional auth roles (if 'all' or empty array, auth not tested)
  const acceptedParameters: helpers.Parameter[] = [
    { name: 'drink', type: 'String', required: true },
    { name: 'id', type: 'ID' },
  ]
  const registeredEvents: helpers.RegisteredEvent[] = [
    { input: { drink: 'gimlet' }, event: 'DrinkOrdered', reducingEntity: 'Drink' },
  ]
  const workToDeDone: helpers.WorkToBeDone[] = [
    {
      workToDo: "capitalize the 'drink' value",
      testedInputParameter: {
        name: 'drink',
        value: 'gimlet',
      },
      reducingEntity: 'Drink',
      expectedResult: 'Gimlet',
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
  if (workToDeDone.length > 0)
    helpers.createWorkToBeDoneTests(workToDeDone, commandMutation, applicationUnderTest, graphQLclient)

  // It should register specific EVENTS
  helpers.createRegisteredEventsTests(registeredEvents, commandMutation, applicationUnderTest, graphQLclient)
})
