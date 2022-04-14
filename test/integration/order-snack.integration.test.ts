// Imports
// =============================================================================
import type { EventEnvelope, ReadModelEnvelope, UUID } from '@boostercloud/framework-types'
import * as helpers from '../helpers'
import { applicationUnderTest, graphQLclient } from '../helpers'
import { describe, it, expect, beforeEach } from 'vitest'
import { faker } from '@faker-js/faker'

// Tested Elements
import { orderSnack as testedCommand } from '../helpers'
const testedReadModel = 'FruitReadModel'

// Test
// =============================================================================
describe('Order Snack Command', async () => {
  // cross-test variables
  let fruit: string
  let drink: string
  let requestId: string | UUID

  beforeEach(() => {
    fruit = faker.random.word()
    drink = faker.random.word()
    requestId = faker.datatype.uuid()
  })

  it('should accept a command successfully', async () => {
    // submit command
    const mutationResult = await testedCommand(graphQLclient, fruit, drink, requestId)
    // evaluate command response
    expect(mutationResult).not.toBeNull()
    expect(mutationResult?.data).toBeTruthy()
  })

  it('should throw an error when required arguments are missing', async () => {
    // submit command
    let mutationResult: { graphQLErrors: { message: string }[] }
    try {
      // should expect a value for fruit
      await testedCommand(graphQLclient, undefined)
    } catch (error) {
      mutationResult = error
    }
    // evaluate command response
    expect(mutationResult?.graphQLErrors[0]?.message).toBeTruthy()
  })

  it('should throw an error when arguments are invalid', async () => {
    // submit command
    let mutationResult: { graphQLErrors: { message: string }[] }
    try {
      // should expect a non-null value for fruit
      await testedCommand(graphQLclient, '')
    } catch (error) {
      mutationResult = error
    }
    // evaluate command response
    expect(mutationResult?.graphQLErrors[0]?.message).toBeTruthy()
  })

  it('should store event in the database', async () => {
    // event store query expects primary key that matches `entityTypeName_entityID_kind` value

    // reference values
    const eventEntity = 'Drink'
    const primaryKey = `${eventEntity}-${requestId}-event`

    // perform action
    await testedCommand(graphQLclient, fruit, drink, requestId)

    // check action's effect
    const actionResult = async (): Promise<unknown[]> => await applicationUnderTest.query.events(primaryKey)

    // wait until action is processed
    await helpers.waitForIt(
      () => actionResult(),
      (matches) => matches?.length > 0
    )

    // evaluate result
    const result = (await actionResult()) as unknown as EventEnvelope[]
    expect(result.filter((record) => record.kind === 'event')).toBeTruthy()
  })

  it('should create a snapshot after event', async () => {
    // event store query expects primary key that matches `entityTypeName_entityID_kind` value

    // reference values
    const eventEntity = 'Drink'
    const primaryKey = `${eventEntity}-${requestId}-snapshot`

    // perform action
    await testedCommand(graphQLclient, fruit, drink, requestId)

    // check action's effect
    const actionResult = async (): Promise<unknown[]> => await applicationUnderTest.query.events(primaryKey)

    // wait until action is processed
    await helpers.waitForIt(
      () => actionResult(),
      (matches) => matches?.length > 0
    )

    // evaluate result
    const result = (await actionResult()) as unknown as EventEnvelope[]
    expect(result.filter((record) => record.kind === 'snapshot')).toBeTruthy()
  })

  it('should update the read model after event', async () => {
    // read model query expects primary key that matches `id` value

    // perform action
    await testedCommand(graphQLclient, fruit, drink, requestId)

    // check action's effect
    const actionResult = async (): Promise<unknown[]> =>
      await applicationUnderTest.query.readModels(requestId as string, testedReadModel)

    // wait until action is processed
    await helpers.waitForIt(
      () => actionResult(),
      (matches) => matches?.length > 0
    )

    // evaluate result
    const result = (await actionResult()) as unknown as ReadModelEnvelope[]
    expect(result).toBeTruthy()
  })
})
