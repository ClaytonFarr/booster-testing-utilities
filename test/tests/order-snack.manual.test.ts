import type { ApplicationTester } from '@boostercloud/application-tester'
import type { EventEnvelope } from '@boostercloud/framework-types'
import type { ApolloClient } from 'apollo-client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import type { DocumentNode } from 'graphql'
import { describe, it, expect } from 'vitest'
import { applicationUnderTest, graphQLclient } from '../helpers'
import { faker } from '@faker-js/faker'
import * as helpers from '../helpers'

// Test
// =================================================================================================
describe('[Manual Data + Tests] Order Snack Command', async () => {
  //
  // TEST SETUP
  // -----------------------------------------------------------------------------------------------
  const commandName = 'OrderSnack'

  // Define Test Data
  // -----------------------------------------------------------------------------------------------
  const authorizedRoles = ['all'] // optional auth role(s) [if 'all' or empty array, auth not tested]
  const acceptedParameters: helpers.Parameter[] = [
    { name: 'fruit', type: 'String', required: true },
    { name: 'drink', type: 'String' },
    { name: 'id', type: 'ID' },
  ]
  const registeredEvents: helpers.RegisteredEvent[] = [
    { input: { fruit: 'apple' }, event: 'FruitOrdered', reducingEntity: 'Fruit' },
    { input: { fruit: 'pear', drink: 'water' }, event: 'DrinkOrdered', reducingEntity: 'Drink' },
    { input: { fruit: 'candy' }, event: 'CandyOrdered', reducingEntity: 'Tattle' },
  ]
  const additionalWorkDone: helpers.WorkToBeDone[] = [
    {
      workToDo: "capitalize the 'fruit' value",
      testedInputParameter: {
        name: 'fruit',
        value: 'apple',
      },
      reducingEntity: 'Fruit',
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
    helpers.createCommandVariableGroups(acceptedParameters)
  const commandMutation = helpers.createCommandMutation(commandName, acceptedParameters)
  const resultWaitTime = 5000

  //
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
    // console.log(`✅ [Command Accepts Expected Params] ${JSON.stringify(mutationResult?.data)}`)
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
        // console.log(`✅ [Command Required Inputs Missing] ${error?.message}`)
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
  if (additionalWorkDone.length > 0) {
    additionalWorkDone.forEach(async (work) => {
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
    const primaryKey = `${work.reducingEntity}-${id}-snapshot`

    // submit command
    const commandVariables = { [work.testedInputParameter.name]: work.testedInputParameter.value, id }
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
    if (work.expectedResult === true) evaluationResult = lookupResults.length > 0
    // ...if a result should NOT exist
    if (work.expectedResult === false) evaluationResult = lookupResults.length === 0
    // ...if expected result should be a value
    if (typeof work.expectedResult === 'string' || typeof work.expectedResult === 'number') {
      const filteredResults = lookupResults.filter(
        (record) => record.value[work.testedInputParameter.name as string] === work.expectedResult
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
        // console.log(`✅ [Command registers event: ${event.event}]`)
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
    const primaryKey = `${registeredEvent.reducingEntity}-${id}-event`

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

  // It reject INVALID authorization
  // -----------------------------------------------------------------------------------------------
  if (authorizedRoles.length > 1 && authorizedRoles.length[0] !== 'all') {
    it.todo('should reject the command when unauthorized', async () => {
      // TODO
      // likely need to create anonymous and auth'd graphQLclients
    })
  }
})
