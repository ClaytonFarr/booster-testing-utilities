import type { ApplicationTester } from '@boostercloud/application-tester'
import type { EventEnvelope } from '@boostercloud/framework-types'
import type { ApolloClient } from 'apollo-client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import type { DocumentNode } from 'graphql'
// import { it, expect } from 'vitest'
import { faker } from '@faker-js/faker'
import { waitForIt } from '../helpers'
import gql from 'graphql-tag'
import path from 'path'
import fs from 'fs'

// Common
// =====================================================================================================================

export const getCommandFileContents = (commandName: string, rootPath = 'src/commands/'): Buffer => {
  const commandNameKebabCase = commandName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  return fs.readFileSync(path.join(rootPath, `${commandNameKebabCase}.ts`))
}

// Command Roles
// =====================================================================================================================

export const getRoles = (commandName: string, commandFileContents?: Buffer, rootPath = 'src/commands/'): string[] => {
  const roles = []
  const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
  const authorizeStatement = fileContents.toString().match(/(authorize.*)/g)
  // remove 'prefix'
  let authorizeString = authorizeStatement[0].replace('authorize: ', '')
  // remove trailing comma
  authorizeString = authorizeString.replace(/,$/, '')
  // exit if roles = 'all'
  if (authorizeString === "'all'") return ['all']
  // remove [] surrounding brackets from authorize string
  authorizeString = authorizeString.replace(/\[|\]/g, '')
  // grab all roles from authorize string
  const roleNames = authorizeString.split(/\s*,\s*/)
  // return roles
  roleNames.forEach((roleName) => roles.push(roleName))
  return roles
}

// Command Parameters
// =====================================================================================================================

export interface Parameter {
  name: string
  type: string
  required?: boolean
}

export const getAcceptedParameters = (
  commandName: string,
  commandFileContents?: Buffer,
  rootPath = 'src/commands/'
): Parameter[] => {
  const acceptedParameters: Parameter[] = []
  const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
  const parameterStatements = fileContents.toString().match(/(readonly.*)/g)
  parameterStatements.forEach((parameterString) => {
    const parameter: Parameter = { name: '', type: '' }
    // remove 'prefix'
    parameterString = parameterString.replace('readonly ', '')
    // remove 'comment' if present
    parameterString = parameterString.replace(/.\/\/.*/, '')
    // remove comma if present from multi-lines
    parameterString = parameterString.replace(',', '')
    // note if the parameter is required
    parameter.required = !parameterString.includes('?') // a '?' = optional parameter
    // capture parameter name
    parameter.name = parameterString.match(/\w+/)[0]
    // capture parameter type + update to match GraphQL types
    const paramType = parameterString.match(/\w+$/)[0]
    if (paramType === 'string') parameter.type = 'String'
    if (paramType === 'number') parameter.type = 'Int'
    if (paramType === 'boolean') parameter.type = 'Boolean'
    if (paramType === 'UUID') parameter.type = 'ID'
    acceptedParameters.push(parameter)
  })
  return acceptedParameters
}

export const getAcceptedParameterNames = (expectedParameters: Parameter[]): string[] =>
  expectedParameters.map(({ name }) => name)

// Generate Parameter Variable Options
// ---------------------------------------------------------------------------------------------------------------------

export const createCommandVariables = (acceptedParameters: Parameter[]): Record<string, string> => {
  return {
    allVariables: createAllVariables(acceptedParameters),
    requiredVariables: createRequiredVariables(acceptedParameters),
    emptyVariables: createEmptyVariables(acceptedParameters),
    invalidDataTypeVariables: createInvalidDataTypeVariables(acceptedParameters),
  }
}

export const createAllVariables = (expectedParameters: Parameter[]): string => {
  const variables = expectedParameters
    .map(({ name, type }) => {
      if (type === 'String') return `"${name}": "${faker.random.word()}"`
      if (type === 'Int') return `"${name}": ${faker.datatype.number()}`
      if (type === 'Boolean') return `"${name}": ${faker.datatype.boolean()}`
      if (type === 'ID') return `"${name}": "${faker.datatype.uuid()}"`
    })
    .filter(Boolean)
    .join(', ')
    .replace(/^(.*)$/, '{ $1 }')
  return JSON.parse(variables)
}

export const createRequiredVariables = (expectedParameters: Parameter[]): string => {
  const variables = expectedParameters
    .map(({ name, type, required }) => {
      if (required) {
        if (type === 'String') return `"${name}": "${faker.random.word()}"`
        if (type === 'Int') return `"${name}": ${faker.datatype.number()}`
        if (type === 'Boolean') return `"${name}": ${faker.datatype.boolean()}`
        if (type === 'ID') return `"${name}": "${faker.datatype.uuid()}"`
      }
    })
    .filter(Boolean)
    .join(', ')
    .replace(/^(.*)$/, '{ $1 }')
  return JSON.parse(variables)
}

export const createEmptyVariables = (expectedParameters: Parameter[]): string => {
  const variables = expectedParameters
    .map(({ name }) => `"${name}": ""`)
    .filter(Boolean)
    .join(', ')
    .replace(/^(.*)$/, '{ $1 }')
  return JSON.parse(variables)
}

export const createInvalidDataTypeVariables = (expectedParameters: Parameter[]): string => {
  const variables = expectedParameters
    .map(({ name, type }) => {
      if (type === 'String') return `"${name}": ${faker.datatype.number()}`
      if (type === 'Int') return `"${name}": "${faker.random.word()}"`
      if (type === 'Boolean') return `"${name}": "${faker.random.word()}"`
      if (type === 'ID') return `"${name}": ${faker.datatype.boolean()}`
    })
    .filter(Boolean)
    .join(', ')
    .replace(/^(.*)$/, '{ $1 }')
  return JSON.parse(variables)
}

// Command Mutation
// =====================================================================================================================

export const createCommandMutation = (commandName: string, expectedParameters: Parameter[]): DocumentNode => {
  const inputsVariables = createMutationInputsVariables(expectedParameters)
  const inputs = createMutationInputs(expectedParameters)
  const content = createMutationContent(commandName, inputsVariables, inputs)
  return gql.gql(content)
}

export const createMutationInputsVariables = (expectedParameters: Parameter[]): string => {
  const inputsVariables = expectedParameters
    .map(({ name, type, required }) => {
      if (required) return `$${name}: ${type}!`
      return `$${name}: ${type}`
    })
    .join(', ')
  return inputsVariables
}

export const createMutationInputs = (expectedParameters: Parameter[]): string => {
  const inputs: string[] | string = expectedParameters
    .map(({ name }) => {
      return `${name}: $${name}`
    })
    .join(', ')
  return inputs
}

export const createMutationContent = (commandName: string, inputsVariables: string, inputs: string): string => {
  const mutationContent = `
      mutation ${commandName}(${inputsVariables}) {
        ${commandName}(input: { ${inputs} })
      }`
  return mutationContent
}

// Command Work
// =====================================================================================================================

export interface WorkToBeDone {
  workToDo: string
  testedInputParameter: {
    name: string
    value: string
  }
  reducingEntity: string
  expectedResult: boolean | string | number
}

// export const createWorkToBeDoneTests = (
//   additionalWorkDone: WorkToBeDone[],
//   commandMutation: DocumentNode,
//   applicationUnderTest: ApplicationTester,
//   graphQLclient: ApolloClient<NormalizedCacheObject>,
//   resultWaitTime = 5000
// ): void => {
//   additionalWorkDone.forEach(async (work) => {
//     it(
//       `should do the work to: ${work.workToDo}`,
//       async () => {
//         const check = await wasWorkDone(commandMutation, work, applicationUnderTest, graphQLclient)
//         expect(check).toBe(true)
//         console.log(`✅ [Command does work: ${work.workToDo}]`)
//       },
//       resultWaitTime + 500
//     )
//   })
// }

export const wasWorkDone = async (
  commandMutation: DocumentNode,
  work: WorkToBeDone,
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
    await waitForIt(
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

// Registered Events
// =====================================================================================================================

export interface RegisteredEvent {
  input: Record<string, unknown>
  event: string
  reducingEntity: string
}

// export const getRegisteredEvents = (
//   commandName: string,
//   commandFileContents?: Buffer,
//   rootPath = 'src/commands/'
// ): RegisteredEvent[] => {
//   const registeredEvents: RegisteredEvent[] = []
//   const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
//   const events = fileContents.toString().match(/register.events\(\n*\s*new\s*(\w*)/g)
//   events.forEach((event) => {

//   })
//   return registeredEvents
// }

export const wasEventRegistered = async (
  commandMutation: DocumentNode,
  registeredEvent: RegisteredEvent,
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
    await waitForIt(
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
