// Imports
// =================================================================================================
import type { EventEnvelope } from '@boostercloud/framework-types'
import * as helpers from '../helpers'
import { applicationUnderTest, graphQLclient } from '../helpers'
import { describe, it, expect } from 'vitest'
import { faker } from '@faker-js/faker'

// Test
// =================================================================================================
describe('Order Snack Command', async () => {
  //
  // TEST SETUP
  // -----------------------------------------------------------------------------------------------
  const commandName = 'OrderSnack'
  const acceptedParameters: helpers.Parameter[] = [
    { name: 'fruit', type: 'String', required: true },
    { name: 'drink', type: 'String' },
    { name: 'id', type: 'ID' },
  ]
  const registeredEvents: helpers.RegisteredEvent[] = [
    // † currently looking up event in database requires knowing one of its reducing entities
    { input: { fruit: 'apple' }, event: 'FruitOrdered', reducingEntity: 'Fruit' },
    { input: { fruit: 'pear', drink: 'water' }, event: 'DrinkOrdered', reducingEntity: 'Drink' },
    { input: { fruit: 'candy' }, event: 'CandyOrdered', reducingEntity: 'Tattle' },
  ]
  const additionalWorkDone = [
    {
      work: "check if request was for 'candy'",
      testedInputParameter: {
        name: 'fruit',
        value: 'candy',
      },
      expectedResult: '', // ? add code to check if CandyOrder event was registered
    },
  ]

  // TEST RESOURCES
  // -----------------------------------------------------------------------------------------------
  const acceptedParameterNames = helpers.getAcceptedParameterNames(acceptedParameters)
  const allVariables = helpers.createAllVariables(acceptedParameters)
  const requiredVariables = helpers.createRequiredVariables(acceptedParameters)
  const emptyVariables = helpers.createEmptyVariables(acceptedParameters)
  const invalidDataTypeVariables = helpers.createInvalidDataTypeVariables(acceptedParameters)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedParameters)

  // TESTS
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

  it.todo('should do wor')

  // it should register specific events
  registeredEvents.forEach(async ({ input: triggeringVariables, event, reducingEntity }) => {
    it(`should register event: ${event}`, async () => {
      // event store query expects primary key that matches `entityTypeName_entityID_kind` value
      const id = faker.datatype.uuid()
      const primaryKey = `${reducingEntity}-${id}-event`

      // command variables
      const commandVariables = { ...triggeringVariables, id }

      // submit command
      try {
        await graphQLclient.mutate({
          variables: commandVariables,
          mutation: commandMutation,
        })
      } catch (error) {
        expect(error).toBeNull()
        console.log("💥 ERROR calling command. Check 'registeredEvents' inputs in test.")
      }

      // check action's effect
      const actionResult = async (): Promise<unknown[]> => await applicationUnderTest.query.events(primaryKey)

      // wait until action is processed
      await helpers.waitForIt(
        () => actionResult(),
        (matches) => matches?.length > 0
      )

      // evaluate result
      const results = (await actionResult()) as unknown as EventEnvelope[]
      const eventsOnly = results.filter((record) => record.kind === 'event')
      expect(eventsOnly).toHaveLength(1)
      console.log(`✅ [Command Registers '${event}']`)
    })
  })
})
