import type { ApplicationTester } from '@boostercloud/application-tester'
import type { EventEnvelope } from '@boostercloud/framework-types'
import type { ApolloClient } from 'apollo-client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import type { DocumentNode } from 'graphql'
import { describe, it, expect } from 'vitest'
import { applicationUnderTest, unAuthGraphQLclient, authGraphQLclient } from '../test-helpers'
import { faker } from '@faker-js/faker'
import * as helpers from '../test-helpers'

// Test
// =================================================================================================
describe('[Explicit Data + Helper Methods] Order Cocktail Command', async () => {
  //
  // TEST SETUP
  // -----------------------------------------------------------------------------------------------
  const commandName = 'OrderCocktail'

  // Define Test Data
  // -----------------------------------------------------------------------------------------------
  const authorizedRoles = ['Mom', 'Dad'] // optional auth roles (if 'all' or empty array, auth not tested)
  const acceptedInputs: helpers.Input[] = [
    { name: 'drink', type: 'String', required: true },
    { name: 'id', type: 'ID' },
  ]
  const registeredEvents: helpers.RegisteredEvent[] = [
    { input: { drink: 'gimlet' }, event: 'DrinkOrdered', evaluatedEntity: 'Drink' },
  ]
  const workToDeDone: helpers.WorkToBeDone[] = [
    {
      workToDo: "capitalize the 'drink' value",
      testInput: { name: 'drink', value: 'gimlet' },
      evaluatedEntity: 'Drink',
      shouldHave: 'Gimlet',
    },
  ]

  // Create Test Resources
  // -----------------------------------------------------------------------------------------------
  const graphQLclient = authorizedRoles[0] === 'all' ? unAuthGraphQLclient : authGraphQLclient(authorizedRoles[0])
  const acceptedInputNames = helpers.getAcceptedInputNames(acceptedInputs)
  const allVariables = helpers.createAllVariables(acceptedInputs)
  const requiredVariables = helpers.createRequiredVariables(acceptedInputs)
  const emptyVariables = helpers.createEmptyVariables(acceptedInputs)
  const invalidDataTypeVariables = helpers.createInvalidDataTypeVariables(acceptedInputs)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedInputs)
  const resultWaitTime = 5000

  //
  // TESTS
  // -----------------------------------------------------------------------------------------------

  // It should perform correct AUTHORIZATION
  // -----------------------------------------------------------------------------------------------
  if (authorizedRoles[0] !== 'all') {
    it('should not allow unauthorized role to make request', async () => {
      // command variables
      const commandVariables = requiredVariables

      // submit command (with non-auth graphQLclient)
      try {
        await graphQLclient.mutate({
          variables: commandVariables,
          mutation: commandMutation,
        })
      } catch (error) {
        // evaluate command response
        expect(error).not.toBeNull()
        // console.log('✅ [Command Rejects Unauthorized Request]')
      }
    })

    authorizedRoles.forEach(async (role) => {
      it(`should allow '${role}' role to make request`, async () => {
        const roleEmail = faker.internet.email()
        const roleToken = applicationUnderTest.token.forUser(roleEmail, role)
        const roleGraphQLclient = applicationUnderTest.graphql.client(roleToken)

        // command variables
        const commandVariables = requiredVariables

        // submit command
        const mutationResult = await roleGraphQLclient.mutate({
          variables: commandVariables,
          mutation: commandMutation,
        })

        // evaluate command response
        expect(mutationResult).not.toBeNull()
        expect(mutationResult?.data).toBeTruthy()
        // console.log(`✅ [Command Accepts Authorized Request for '${role}']`)
      })
    })
  }

  // It should accept ALL INPUTS
  // -----------------------------------------------------------------------------------------------
  it(`should accept the inputs: ${acceptedInputNames.join(', ')}`, async () => {
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
    // console.log(`✅ [Command Accepts Expected Inputs] ${JSON.stringify(mutationResult?.data)}`)
  })

  // It should fail if MISSING REQUIRED input(s)
  // -----------------------------------------------------------------------------------------------
  if (acceptedInputs.filter((input) => input.required).length > 0) {
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
        // console.log(`✅ [Command Required Inputs Missing] ${error?.message}`)
      }
    })
  }

  // It should succeed with ONLY REQUIRED input(s)
  // -----------------------------------------------------------------------------------------------
  if (acceptedInputs.filter((input) => input.required).length > 0) {
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
      // console.log(`✅ [Command Only Required Inputs] ${JSON.stringify(mutationResult?.data)}`)
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
      // console.log(`✅ [Command Input Values Empty] ${error?.message}`)
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
      // console.log(`✅ [Command Input Invalid Types] ${error?.message}`)
    }
  })

  // It should do specific WORK
  // -----------------------------------------------------------------------------------------------
  if (workToDeDone.length > 0) {
    workToDeDone.forEach(async (work) => {
      it(
        `should do the work to: ${work.workToDo}`,
        async () => {
          const check = await wasWorkDone(commandMutation, work, applicationUnderTest, graphQLclient)
          expect(check).toBe(true)
          // console.log(`✅ [Command does work: ${work.workToDo}]`)
        },
        resultWaitTime + 500 // custom timeout to accommodate use of `waitForIt` in `wasWorkDone`
      )
    })
  }
  const wasWorkDone = async (
    commandMutation: DocumentNode,
    work: helpers.WorkToBeDone,
    applicationUnderTest: ApplicationTester,
    graphQLclient: ApolloClient<NormalizedCacheObject>,
    resultWaitTime = 5000
  ): Promise<boolean> => {
    // reference values
    const id = faker.datatype.uuid()
    const primaryKey = `${work.evaluatedEntity}-${id}-snapshot`

    // submit command
    const commandVariables = { [work.testInput.name]: work.testInput.value, id }
    await graphQLclient.mutate({ variables: commandVariables, mutation: commandMutation })

    // wait until action is processed
    try {
      await helpers.waitForIt(
        () => applicationUnderTest.query.events(primaryKey),
        (matches) => matches?.length > 0,
        500,
        resultWaitTime
      )
    } catch (error) {
      console.log(`💥 [Command did not do '${work.workToDo}' within ${resultWaitTime / 1000} seconds]`)
    }

    // evaluate result
    const lookupResults = (await applicationUnderTest.query.events(primaryKey)) as unknown as EventEnvelope[]
    let evaluationResult: boolean
    // ...if a result should simply exist
    if (work.shouldHave === true) evaluationResult = lookupResults.length > 0
    // ...if a result should NOT exist
    if (work.shouldHave === false) evaluationResult = lookupResults.length === 0
    // ...if expected result should be a value
    if (typeof work.shouldHave === 'string' || typeof work.shouldHave === 'number') {
      const filteredResults = lookupResults.filter(
        (record) => record.value[work.testInput.name as string] === work.shouldHave
      )
      evaluationResult = filteredResults.length > 0
    }
    return evaluationResult
  }

  // It should register specific EVENTS
  // -----------------------------------------------------------------------------------------------
  registeredEvents.forEach(async (event) => {
    it(
      `should register the event: ${event.event}`,
      async () => {
        const check = await wasEventRegistered(commandMutation, event, applicationUnderTest, graphQLclient)
        expect(check).toBe(true)
        // console.log(`✅ [Command Registers Event: ${event.event}]`)
      },
      resultWaitTime + 500 // custom timeout to accommodate use of `waitForIt` in `wasEventRegistered`
    )
  })
  const wasEventRegistered = async (
    commandMutation: DocumentNode,
    registeredEvent: helpers.RegisteredEvent,
    applicationUnderTest: ApplicationTester,
    graphQLclient: ApolloClient<NormalizedCacheObject>,
    resultWaitTime = 5000
  ): Promise<boolean> => {
    // event store query expects primary key that matches `entityTypeName_entityID_kind` value
    const id = faker.datatype.uuid()
    const primaryKey = `${registeredEvent.evaluatedEntity}-${id}-event`

    // command variables
    const commandVariables = { ...registeredEvent.input, id }

    // submit command
    try {
      await graphQLclient.mutate({
        variables: commandVariables,
        mutation: commandMutation,
      })
    } catch (error) {
      console.log("💥 ERROR calling command. Check 'registeredEvents' inputs in test.")
    }

    // check action's effect
    const actionResult = async (): Promise<unknown[]> => await applicationUnderTest.query.events(primaryKey)

    // wait until action is processed
    try {
      await helpers.waitForIt(
        () => actionResult(),
        (matches) => matches?.length > 0,
        500,
        resultWaitTime
      )
    } catch (error) {
      console.log(`💥 [Command did not register '${registeredEvent.event}' within ${resultWaitTime / 1000} seconds]`)
    }

    // evaluate result
    const results = (await actionResult()) as unknown as EventEnvelope[]
    const eventsOnly = results.filter((record) => record.kind === 'event')
    return eventsOnly.length > 0
  }
})
