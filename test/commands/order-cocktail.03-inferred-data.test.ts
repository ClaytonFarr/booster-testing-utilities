import { describe } from 'vitest'
import { applicationUnderTest, unAuthGraphQLclient, authGraphQLclient } from '../test-helpers'
import * as helpers from '../test-helpers'

// Test
// =================================================================================================
const commandName = 'OrderCocktail'

describe(`[Inferred Data + Helper Methods] ${helpers.pascalToTitleCase(commandName)} Command`, async () => {
  // Retrieve Test Data
  // -----------------------------------------------------------------------------------------------
  const commandFileContents = helpers.getCommandFileContents(commandName)
  const authorizedRoles: helpers.Role[] | string[] = helpers.getRoles(commandName, commandFileContents)
  const acceptedInputs: helpers.Input[] = helpers.getAcceptedInputs(commandName, commandFileContents)
  const workToDeDone: helpers.WorkToBeDone[] = helpers.getWorkToBeDone(commandName, commandFileContents)
  const registeredEvents: helpers.RegisteredEvent[] = helpers.getRegisteredEvents(commandName, commandFileContents)

  // Create Test Resources
  // -----------------------------------------------------------------------------------------------
  const graphQLclient = authorizedRoles[0] === 'all' ? unAuthGraphQLclient : authGraphQLclient(authorizedRoles[0])
  const acceptedInputNames = helpers.getAcceptedInputNames(acceptedInputs)
  const allVariables = helpers.createAllVariables(acceptedInputs)
  const requiredVariables = helpers.createRequiredVariables(acceptedInputs)
  const emptyVariables = helpers.createEmptyVariables(acceptedInputs)
  const invalidDataTypeVariables = helpers.createInvalidDataTypeVariables(acceptedInputs)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedInputs)

  // TESTS
  // -----------------------------------------------------------------------------------------------

  // It should perform correct AUTHORIZATION
  if (authorizedRoles[0] !== 'all') helpers.createRolesTests(authorizedRoles, commandMutation, requiredVariables)

  // It should accept ALL INPUTS
  helpers.createAcceptAllInputsTest(commandMutation, allVariables, acceptedInputNames, graphQLclient)

  // It should fail if MISSING REQUIRED input(s)
  if (acceptedInputs.filter((input) => input.required).length > 0)
    helpers.createMissingRequiredInputTest(commandMutation, graphQLclient)

  // It should succeed with ONLY REQUIRED input(s)
  if (acceptedInputs.filter((input) => input.required).length > 0)
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
