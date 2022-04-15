// Imports
// =================================================================================================
import { describe, it, expect } from 'vitest'
import { applicationUnderTest, graphQLclient } from '../helpers'
import * as helpers from '../helpers'

// Test
// =================================================================================================
describe('Order Snack Command', async () => {
  //
  // TEST SETUP
  // -----------------------------------------------------------------------------------------------
  const commandName = 'OrderSnack'

  // const authorizedRoles = ['all'] // optional auth role(s) [if 'all' or empty array, auth not tested]
  // const acceptedParameters: helpers.Parameter[] = [
  //   { name: 'fruit', type: 'String', required: true },
  //   { name: 'drink', type: 'String' },
  //   { name: 'id', type: 'ID' },
  // ]

  const commandFileContents = helpers.getCommandFileContents(commandName)
  const authorizedRoles: string[] = helpers.getRoles(commandName, commandFileContents)
  const acceptedParameters: helpers.Parameter[] = helpers.getAcceptedParameters(commandName, commandFileContents)

  const registeredEvents: helpers.RegisteredEvent[] = [
    // currently looking up an event in database requires knowing one of its reducing entities
    { input: { fruit: 'apple' }, event: 'FruitOrdered', reducingEntity: 'Fruit' },
    { input: { fruit: 'pear', drink: 'water' }, event: 'DrinkOrdered', reducingEntity: 'Drink' },
    { input: { fruit: 'candy' }, event: 'CandyOrdered', reducingEntity: 'Tattle' },
  ]
  const additionalWorkDone: helpers.WorkToBeDone[] = [
    {
      workToDo: "capitalize the 'fruit' value",
      // currently presumes work can be triggered by single input parameter
      testedInputParameter: {
        name: 'fruit',
        value: 'apple',
      },
      // result lookup currently requires knowing the entity the result will be stored in
      reducingEntity: 'Fruit',
      // currently presumes result value exists on field with same name as `testedInputParameter.name`
      expectedResult: 'Apple',
    },
    {
      workToDo: 'tattle when candy is ordered',
      testedInputParameter: {
        name: 'fruit',
        value: 'candy',
      },
      reducingEntity: 'Tattle',
      expectedResult: true,
    },
  ]

  // Create Test Resources
  // -----------------------------------------------------------------------------------------------
  const acceptedParameterNames = helpers.getAcceptedParameterNames(acceptedParameters)
  const { allVariables, requiredVariables, emptyVariables, invalidDataTypeVariables } =
    helpers.createCommandVariables(acceptedParameters)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedParameters)
  const resultWaitTime = 5000

  // TESTS
  // -----------------------------------------------------------------------------------------------

  // It should accept ALL PARAMETERS
  // -----------------------------------------------------------------------------------------------
  it(`should accept the parameters: ${acceptedParameterNames.join(', ')}`, async () => {
    // command variables
    const commandVariables = allVariables

    // submit command
    const mutationResult = await graphQLclient.mutate({
      variables: commandVariables,
      mutation: commandMutation,
    })

    // evaluate command response
    expect(mutationResult).not.toBeNull()
    expect(mutationResult?.data).toBeTruthy()
    console.log(`✅ [Command Accepts Expected Params] ${JSON.stringify(mutationResult?.data)}`)
  })

  // It should fail if MISSING REQUIRED input(s)
  // -----------------------------------------------------------------------------------------------
  if (acceptedParameters.filter((param) => param.required).length > 0) {
    it('should throw an error when required inputs are missing', async () => {
      // command variables
      const commandVariables = {} // no variables = no required inputs

      // submit command
      try {
        await graphQLclient.mutate({
          variables: commandVariables,
          mutation: commandMutation,
        })
      } catch (error) {
        // evaluate command response
        expect(error).not.toBeNull()
        expect(error?.message).toBeTruthy()
        console.log(`✅ [Command Required Inputs Missing] ${error?.message}`)
      }
    })
  }

  // It should succeed with ONLY REQUIRED input(s)
  // -----------------------------------------------------------------------------------------------
  if (acceptedParameters.filter((param) => param.required).length > 0) {
    it('should succeed when submitting only required inputs', async () => {
      // command variables
      const commandVariables = requiredVariables

      // submit command
      const mutationResult = await graphQLclient.mutate({
        variables: commandVariables,
        mutation: commandMutation,
      })

      // evaluate command response
      expect(mutationResult).not.toBeNull()
      expect(mutationResult?.data).toBeTruthy()
      console.log(`✅ [Command Only Required Inputs] ${JSON.stringify(mutationResult?.data)}`)
    })
  }

  // It should reject EMPTY inputs
  // -----------------------------------------------------------------------------------------------
  it('should throw an error when inputs values are empty', async () => {
    // command variables
    const commandVariables = emptyVariables

    // submit command
    try {
      await graphQLclient.mutate({
        variables: commandVariables,
        mutation: commandMutation,
      })
    } catch (error) {
      // evaluate command response
      expect(error).not.toBeNull()
      expect(error?.message).toBeTruthy()
      console.log(`✅ [Command Input Values Empty] ${error?.message}`)
    }
  })

  // It should reject INVALID data types
  // -----------------------------------------------------------------------------------------------
  it('should throw an error when inputs are of an invalid type', async () => {
    // command variables
    const commandVariables = invalidDataTypeVariables

    // submit command
    try {
      await graphQLclient.mutate({
        variables: commandVariables,
        mutation: commandMutation,
      })
    } catch (error) {
      // evaluate command response
      expect(error).not.toBeNull()
      expect(error?.message).toBeTruthy()
      console.log(`✅ [Command Input Invalid Types] ${error?.message}`)
    }
  })

  // It should register specific EVENTS
  // -----------------------------------------------------------------------------------------------
  registeredEvents.forEach(async (event) => {
    it(
      `should register the event: ${event.event}`,
      async () => {
        const check = await helpers.wasEventRegistered(commandMutation, event, applicationUnderTest, graphQLclient)
        expect(check).toBe(true)
        console.log(`✅ [Command registers event: ${event.event}]`)
      },
      resultWaitTime + 500 // custom timeout to accommodate use of `waitForIt` in `wasEventRegistered`
    )
  })

  // It should do specific WORK
  // -----------------------------------------------------------------------------------------------
  if (additionalWorkDone.length > 0) {
    additionalWorkDone.forEach(async (work) => {
      it(
        `should do the work to: ${work.workToDo}`,
        async () => {
          const check = await helpers.wasWorkDone(commandMutation, work, applicationUnderTest, graphQLclient)
          expect(check).toBe(true)
          console.log(`✅ [Command does work: ${work.workToDo}]`)
        },
        resultWaitTime + 500 // custom timeout to accommodate use of `waitForIt` in `wasWorkDone`
      )
    })
  }

  // It reject INVALID authorization
  // -----------------------------------------------------------------------------------------------
  if (authorizedRoles.length > 1 && authorizedRoles.length[0] !== 'all') {
    it.todo('should reject the command when unauthorized', async () => {
      // TODO
      // likely need to create anonymous and auth'd graphQLclients
    })
  }
})
