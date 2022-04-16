import { describe } from 'vitest'
import { applicationUnderTest, graphQLclient } from '../helpers'
import * as helpers from '../helpers'

// Test
// =================================================================================================
const commandName = 'OrderSnack'

describe.skip(`[Auto Retrieved Data] ${helpers.pascalToTitleCase(commandName)} Command`, async () => {
  // Retrieve Test Data
  // -----------------------------------------------------------------------------------------------
  const commandFileContents = helpers.getCommandFileContents(commandName)
  const authorizedRoles: helpers.Role[] | string[] = helpers.getRoles(commandName, commandFileContents)
  const acceptedParameters: helpers.Parameter[] = helpers.getAcceptedParameters(commandName, commandFileContents)
  const registeredEvents: helpers.RegisteredEvent[] = helpers.getRegisteredEvents(commandName, commandFileContents)
  const additionalWorkDone: helpers.WorkToBeDone[] = helpers.getWorkToBeDone(commandName, commandFileContents)

  // Create Test Resources
  // -----------------------------------------------------------------------------------------------
  const acceptedParameterNames = helpers.getAcceptedParameterNames(acceptedParameters)
  const { allVariables, requiredVariables, emptyVariables, invalidDataTypeVariables } =
    helpers.createCommandVariableGroups(acceptedParameters)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedParameters)

  // TESTS
  // -----------------------------------------------------------------------------------------------

  // It should accept ALL PARAMETERS
  helpers.createAcceptAllParametersTest(commandMutation, allVariables, acceptedParameterNames, graphQLclient)

  // It should fail if MISSING REQUIRED input(s)
  if (acceptedParameters.filter((param) => param.required).length > 0)
    helpers.createMissingRequiredInputTest(commandMutation, graphQLclient)

  // It should succeed with ONLY REQUIRED input(s)
  if (acceptedParameters.filter((param) => param.required).length > 0)
    helpers.createSubmitOnlyRequiredInputsTest(commandMutation, requiredVariables, graphQLclient)

  // It should reject EMPTY inputs
  helpers.createRejectInvalidInputTypesTest(commandMutation, emptyVariables, graphQLclient)

  // It should reject INVALID data types
  helpers.createRejectInvalidInputTypesTest(commandMutation, invalidDataTypeVariables, graphQLclient)

  // It should possibly do specific WORK
  if (additionalWorkDone.length > 0)
    helpers.createWorkToBeDoneTests(additionalWorkDone, commandMutation, applicationUnderTest, graphQLclient)

  // It should register specific EVENTS
  helpers.createRegisteredEventsTests(registeredEvents, commandMutation, applicationUnderTest, graphQLclient)

  // It should perform correct AUTHORIZATION
  // TODO finish test methods
  if (authorizedRoles.length > 1 && authorizedRoles.length[0] !== 'all')
    helpers.createRolesTests(authorizedRoles as helpers.Role[], commandMutation, requiredVariables, graphQLclient)
})
