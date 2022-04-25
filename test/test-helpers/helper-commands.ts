import type { ApplicationTester } from '@boostercloud/application-tester'
import type { EventEnvelope } from '@boostercloud/framework-types'
import type { ApolloClient } from 'apollo-client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import type { DocumentNode } from 'graphql'
import { applicationUnderTest, unAuthGraphQLclient, authGraphQLclient } from '../test-helpers'
import { describe, it, expect } from 'vitest'
import { faker } from '@faker-js/faker'
import { waitForIt, isStringJSON } from '.'
import gql from 'graphql-tag'
import path from 'path'
import fs from 'fs'
import console from 'console'

// General
// =====================================================================================================================

export const generateCommandTests = (commandName: string): void => {
  const commandNameReadable = commandName.replace(/([a-z])([A-Z])/g, '$1 $2')

  describe(`[Auto-Generated Tests] ${commandNameReadable} Command`, async () => {
    // Retrieve Test Data
    // -----------------------------------------------------------------------------------------------
    const commandFileContents = getCommandFileContents(commandName)
    const authorizedRoles: Role[] | string[] = getRoles(commandName, commandFileContents)
    const acceptedInputs: Input[] = getAcceptedInputs(commandName, commandFileContents)
    const workToDeDone: WorkToBeDone[] = getWorkToBeDone(commandName, commandFileContents)
    const registeredEvents: RegisteredEvent[] = getRegisteredEvents(commandName, commandFileContents)

    // Create Test Resources
    // -----------------------------------------------------------------------------------------------
    const graphQLclient = authorizedRoles[0] === 'all' ? unAuthGraphQLclient : authGraphQLclient(authorizedRoles[0])
    const acceptedInputNames = getAcceptedInputNames(acceptedInputs)
    const allVariables = createAllVariables(acceptedInputs)
    const requiredVariables = createRequiredVariables(acceptedInputs)
    const emptyVariables = createEmptyVariables(acceptedInputs)
    const invalidDataTypeVariables = createInvalidDataTypeVariables(acceptedInputs)
    const commandMutation = createCommandMutation(commandName, acceptedInputs)

    // TESTS
    // -----------------------------------------------------------------------------------------------

    // It should perform correct AUTHORIZATION
    if (authorizedRoles[0] !== 'all') createRolesTests(authorizedRoles, commandMutation, requiredVariables)

    // It should accept ALL INPUTS
    createAcceptAllInputsTest(commandMutation, allVariables, acceptedInputNames, graphQLclient)

    // It should fail if MISSING REQUIRED input(s)
    if (acceptedInputs.filter((input) => input.required).length > 0)
      createMissingRequiredInputTest(commandMutation, graphQLclient)

    // It should succeed with ONLY REQUIRED input(s)
    if (acceptedInputs.filter((input) => input.required).length > 0)
      createSubmitOnlyRequiredInputsTest(commandMutation, requiredVariables, graphQLclient)

    // It should reject EMPTY inputs
    createRejectEmptyInputsTest(commandMutation, emptyVariables, graphQLclient)

    // It should reject INVALID data types
    createRejectInvalidInputTypesTest(commandMutation, invalidDataTypeVariables, graphQLclient)

    // It should possibly do specific WORK
    if (workToDeDone.length > 0)
      createWorkToBeDoneTests(workToDeDone, commandMutation, applicationUnderTest, graphQLclient)

    // It should register specific EVENTS
    createRegisteredEventsTests(registeredEvents, commandMutation, applicationUnderTest, graphQLclient)
  })
}

export const getCommandFileContents = (commandName: string, rootPath = 'src/commands/'): Buffer => {
  const commandNameKebabCase = commandName.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
  return fs.readFileSync(path.join(rootPath, `${commandNameKebabCase}.ts`))
}

// Command Roles
// =====================================================================================================================

export interface Role {
  name: string
}

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

export const createRolesTests = (
  authorizedRoles: string[],
  commandMutation: DocumentNode,
  requiredVariables: string
): void => {
  // check unauthorized request
  it('should not allow unauthorized role to make request', async () => {
    const check = await wasUnauthorizedRequestRejected(commandMutation, requiredVariables)
    expect(check).toBe(true)
    // console.log('✅ [Command Rejects Unauthorized Request]')
  })

  // check authorized request(s)
  authorizedRoles.forEach(async (role) => {
    it(`should allow '${role}' role to make request`, async () => {
      const check = await wasAuthorizedRequestAllowed(role, commandMutation, requiredVariables)
      expect(check).toBe(true)
      // console.log(`✅ [Command Accepts Authorized Request for '${role.name}']`)
    })
  })
}

export const wasUnauthorizedRequestRejected = async (
  commandMutation: DocumentNode,
  requiredVariables: string,
  graphQLclient = unAuthGraphQLclient
): Promise<boolean> => {
  // command variables
  const commandVariables = requiredVariables

  // submit command (with non-auth graphQLclient)
  let commandRejection: Record<string, unknown>
  try {
    await graphQLclient.mutate({
      variables: commandVariables,
      mutation: commandMutation,
    })
  } catch (error) {
    commandRejection = error
  }

  // evaluate command response
  return !!commandRejection
}

export const wasAuthorizedRequestAllowed = async (
  role: string,
  commandMutation: DocumentNode,
  requiredVariables: string
): Promise<boolean> => {
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
  return !!mutationResult?.data
}

// Command Inputs
// =====================================================================================================================

export interface Input {
  name: string
  type: string
  required?: boolean
  validExample?: string | number | boolean
}

export const getAcceptedInputs = (
  commandName: string,
  commandFileContents?: Buffer,
  rootPath = 'src/commands/'
): Input[] => {
  const acceptedInputs: Input[] = []
  const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
  const inputStatements = fileContents.toString().match(/(readonly.*)/g)
  inputStatements.forEach((inputString) => {
    const input: Input = { name: '', type: '' }
    // remove 'prefix'
    inputString = inputString.replace('readonly ', '')
    // parse '@validExample' comment value, if present
    let validExample: string | number | boolean
    if (inputString.includes('@validExample')) {
      validExample = inputString
        .match(/@validExample:\s*(.*)/)[1]
        .replace(/"/g, '')
        .replace(/'/g, '')
      input.validExample = validExample
    }
    // remove comment if present
    inputString = inputString.replace(/.\/\/.*/, '')
    // remove comma if present from multi-lines
    inputString = inputString.replace(',', '')
    // note if the input is required
    input.required = !inputString.includes('?') // a '?' = optional input
    // capture input name
    input.name = inputString.match(/\w+/)[0]
    // capture input type + update to match GraphQL types
    const inputType = inputString.match(/\w+$/)[0]
    if (inputType === 'string') input.type = 'String'
    if (inputType === 'number') input.type = 'Int'
    if (inputType === 'boolean') input.type = 'Boolean'
    if (inputType === 'UUID') input.type = 'ID'
    acceptedInputs.push(input)
  })
  return acceptedInputs
}

export const getAcceptedInputNames = (acceptedInputs: Input[]): string[] => acceptedInputs.map(({ name }) => name)

// Generate Input Variable Options
// ---------------------------------------------------------------------------------------------------------------------

export const createAllVariables = (acceptedInputs: Input[]): string => {
  const variables = acceptedInputs
    .map(({ name, type, validExample }) => {
      if (validExample && typeof validExample === 'string') return `"${name}": "${validExample}"`
      if (validExample && typeof validExample !== 'string') return `"${name}": ${validExample}`
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

export const createRequiredVariables = (acceptedInputs: Input[]): string => {
  const variables = acceptedInputs
    .map(({ name, type, required, validExample }) => {
      if (required) {
        if (validExample && typeof validExample === 'string') return `"${name}": "${validExample}"`
        if (validExample && typeof validExample !== 'string') return `"${name}": ${validExample}`
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

export const createEmptyVariables = (acceptedInputs: Input[]): string => {
  const variables = acceptedInputs
    .map(({ name }) => `"${name}": ""`)
    .filter(Boolean)
    .join(', ')
    .replace(/^(.*)$/, '{ $1 }')
  return JSON.parse(variables)
}

export const createInvalidDataTypeVariables = (acceptedInputs: Input[]): string => {
  const variables = acceptedInputs
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

// Input Tests
// ---------------------------------------------------------------------------------------------------------------------

export const createAcceptAllInputsTest = (
  commandMutation: DocumentNode,
  allVariables: string,
  acceptedInputNames: string[],
  graphQLclient: ApolloClient<NormalizedCacheObject>
): void => {
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
}

export const createMissingRequiredInputTest = (
  commandMutation: DocumentNode,
  graphQLclient: ApolloClient<NormalizedCacheObject>
): void => {
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

export const createSubmitOnlyRequiredInputsTest = (
  commandMutation: DocumentNode,
  requiredVariables: string,
  graphQLclient: ApolloClient<NormalizedCacheObject>
): void => {
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

export const createRejectEmptyInputsTest = (
  commandMutation: DocumentNode,
  emptyVariables: string,
  graphQLclient: ApolloClient<NormalizedCacheObject>
): void => {
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
}

export const createRejectInvalidInputTypesTest = (
  commandMutation: DocumentNode,
  invalidDataTypeVariables: string,
  graphQLclient: ApolloClient<NormalizedCacheObject>
): void => {
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
}

// Command Mutation
// =====================================================================================================================

export const createCommandMutation = (commandName: string, acceptedInputs: Input[]): DocumentNode => {
  const inputsVariables = createMutationInputsVariables(acceptedInputs)
  const inputs = createMutationInputs(acceptedInputs)
  const content = createMutationContent(commandName, inputsVariables, inputs)
  return gql.gql(content)
}

export const createMutationInputsVariables = (acceptedInputs: Input[]): string => {
  const inputsVariables = acceptedInputs
    .map(({ name, type, required }) => {
      if (required) return `$${name}: ${type}!`
      return `$${name}: ${type}`
    })
    .join(', ')
  return inputsVariables
}

export const createMutationInputs = (acceptedInputs: Input[]): string => {
  const inputs: string[] | string = acceptedInputs
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
  testInputs: Record<string, unknown>
  evaluatedEntity: string
  shouldHave?: boolean | Array<string | number> // can be true or ['one', 'or more strings or numbers', 123]
  shouldNotHave?: boolean | Array<string | number>
}

export const getWorkToBeDone = (
  commandName: string,
  commandFileContents?: Buffer,
  rootPath = 'src/commands/'
): WorkToBeDone[] => {
  // get work comments
  const workToBeDone: WorkToBeDone[] = []
  const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
  const workComments = [...fileContents.toString().matchAll(/@work(\d+).*/g)]

  // determine total number of work items (by reducing work indexes within Set)
  const workItemCount = new Set(workComments.map(([, workGroup]) => workGroup)).size

  // group comments by work item
  const workItems = []
  for (let i = 0; i < workItemCount; i++) {
    const workGroupIndexRef = i.toString().length === 1 ? '0' + (i + 1).toString() : (i + 1).toString()
    workItems.push([]) // create empty array for each work item
    workItems[i] = workComments.filter(([, index]) => index === workGroupIndexRef)
  }

  // parse work comments for test inputs
  workItems.forEach((workItem, i) => {
    // create empty object for work item
    const thisWorkToBeDone: WorkToBeDone = {
      workToDo: '',
      testInputs: {},
      evaluatedEntity: '',
      shouldHave: [],
    }

    // create work item ref that matches index used in comments
    const workItemIndexRef = (i + 1).toString().length === 1 ? '0' + (i + 1).toString() : (i + 1).toString()

    // parse work description (if not present, exit)
    const workToDo = workItem
      .filter(([statement, index]) => statement.includes(`@work${index}: `))[0]?.[0]
      .replace(`@work${workItemIndexRef}: `, '')
    thisWorkToBeDone.workToDo = workToDo

    // parse work input (if not present, exit with error)
    let inputs = {}
    const testInputString = workItem
      .filter(([statement, index]) => statement.includes(`@work${index}-inputs: `))[0]?.[0]
      .replace(/@work\d*-inputs:\s*|\s|{|}/g, '')
    if (!testInputString) throw Error(`Missing '@work${workItemIndexRef}-inputs' comment in ${commandName}`)
    const testInputGroups = testInputString.split(',') // capture multiple inputs if present
    testInputGroups.forEach((input: string) => {
      const thisInput = {}
      let inputValue: string | number | boolean = input.split(':')[1].replace(/'/g, '').replace(/"/g, '')
      // create suitable example value if a generic label was used
      if (inputValue === 'string') inputValue = faker.random.word()
      if (inputValue === 'number') inputValue = faker.datatype.number()
      if (inputValue === 'boolean') inputValue = faker.datatype.boolean()
      if (inputValue === 'id') inputValue = faker.datatype.uuid()
      // add input name with value
      thisInput[input.split(':')[0]] = inputValue
      inputs = { ...inputs, ...thisInput }
    })
    thisWorkToBeDone.testInputs = inputs

    // parse reducing entity (if not present, exit)
    const evaluatedEntity = workItem
      .filter(([statement, index]) => statement.includes(`@work${index}-entity: `))[0]?.[0]
      .replace(`@work${workItemIndexRef}-entity: `, '')
      .replace(/'/g, '')
      .replace(/"/g, '')
    if (!evaluatedEntity) throw Error(`Missing '@work${workItemIndexRef}-entity' comment in ${commandName}`)
    thisWorkToBeDone.evaluatedEntity = evaluatedEntity

    // parse expected result (if not present, exit)
    let shouldHave: boolean | (string | number)[]
    const shouldHaveString = workItem
      .filter(([statement, index]) => statement.includes(`@work${index}-shouldHave: `))[0]?.[0]
      .replace(/@work\d*-shouldHave:\s*|\s|\[|\]/g, '')
    if (!shouldHaveString) throw Error(`Missing '@work${workItemIndexRef}-shouldHave' comment in ${commandName}`)
    if (shouldHaveString === 'true') shouldHave = true
    if (shouldHaveString === 'false') shouldHave = false
    if (shouldHaveString !== 'true' && shouldHaveString !== 'false') {
      const shouldHaveArray = shouldHaveString.split(',') // capture multiple items if present
      shouldHave = shouldHaveArray.map((item: string) => item.replace(/'/g, '').replace(/"/g, '')) // remove quotes, if present
    }
    thisWorkToBeDone.shouldHave = shouldHave

    // alert if missing work description
    if (!workToDo && (testInputString || evaluatedEntity || shouldHaveString))
      throw Error(`Missing '@work${workItemIndexRef}' description in ${commandName}`)

    // add work item to work to be done
    workToBeDone.push(thisWorkToBeDone)
  })

  return workToBeDone
}

export const createWorkToBeDoneTests = (
  workToBeDone: WorkToBeDone[],
  commandMutation: DocumentNode,
  applicationUnderTest: ApplicationTester,
  graphQLclient: ApolloClient<NormalizedCacheObject>,
  resultWaitTime = 5000
): void => {
  workToBeDone.forEach(async (work) => {
    it(
      `should do the work to: ${work.workToDo}`,
      async () => {
        const check = await wasWorkDone(commandMutation, work, applicationUnderTest, graphQLclient)
        expect(check).toBe(true)
        // console.log(`✅ [Command does work: ${work.workToDo}]`)
      },
      resultWaitTime + 500
    )
  })
}

export const wasWorkDone = async (
  commandMutation: DocumentNode,
  work: WorkToBeDone,
  applicationUnderTest: ApplicationTester,
  graphQLclient: ApolloClient<NormalizedCacheObject>,
  resultWaitTime = 5000
): Promise<boolean> => {
  // reference values
  const tid = work.testInputs?.tid || faker.datatype.uuid().toString() // test id input ('tid') is set to 'string' type to other accept custom values
  const primaryKey = `${work.evaluatedEntity}-${tid}-snapshot`

  // submit command
  const commandVariables = { tid, ...work.testInputs }
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
  let shouldHaveEvaluationResult: boolean
  let shouldNotHaveEvaluationResult: boolean
  let finalEvaluationResult: boolean

  // ...if a result should simply exist
  if (work.shouldHave === true) finalEvaluationResult = lookupResults.length > 0
  if (work.shouldHave === false) throw Error("If trying to test for absence of result, use 'shouldNotHave: false'")

  // ...if a result should NOT exist
  if (work.shouldNotHave === true) finalEvaluationResult = lookupResults.length === 0
  if (work.shouldNotHave === false) throw Error("If trying to test for presence of result, use 'shouldHave: true'")

  if (!work.shouldHave && !work.shouldNotHave)
    throw Error("Please include 'shouldHave' and/or 'shouldNotHave' for work item")

  // ...if expected result should include one or more values, check all values are present
  if (typeof work.shouldHave === 'object') {
    let filteredResults = lookupResults
    work.shouldHave.forEach((expectedValue) => {
      let filter = expectedValue
      if (typeof expectedValue === 'string' && !isStringJSON(expectedValue.toString()))
        // if a standard string, remove quotes for test (skip if stringified JSON)
        filter = expectedValue.replace(/'/g, '').replace(/"/g, '')
      filteredResults = filteredResults.filter((record) => JSON.stringify(record.value).includes(filter.toString()))
    })
    // should return true if all values are present
    shouldHaveEvaluationResult = filteredResults.length > 0
    finalEvaluationResult = shouldHaveEvaluationResult // will be overridden if shouldNotHave is present as well
  }

  // ...if expected result should NOT include one or more values, check all values are NOT present
  if (typeof work.shouldNotHave === 'object') {
    let filteredResults = lookupResults
    work.shouldNotHave.forEach((expectedValue) => {
      let filter = expectedValue
      if (typeof expectedValue === 'string' && !isStringJSON(expectedValue.toString()))
        // if a standard string, remove quotes for test (skip if stringified JSON)
        filter = expectedValue.replace(/'/g, '').replace(/"/g, '')
      filteredResults = filteredResults.filter((record) => JSON.stringify(record.value).includes(filter.toString()))
    })
    // should return true if all values are NOT present
    shouldNotHaveEvaluationResult = filteredResults.length === 0
    finalEvaluationResult = shouldNotHaveEvaluationResult // will be overridden if shouldHave is present as well
  }

  if (shouldHaveEvaluationResult && shouldNotHaveEvaluationResult)
    finalEvaluationResult = shouldHaveEvaluationResult && shouldNotHaveEvaluationResult

  return finalEvaluationResult
}

// Command Registered Events
// =====================================================================================================================

export interface RegisteredEvent {
  input: Record<string, unknown>
  event: string
  evaluatedEntity: string
}

export const getRegisteredEvents = (
  commandName: string,
  commandFileContents?: Buffer,
  rootPath = 'src/commands/'
): RegisteredEvent[] => {
  const registeredEvents: RegisteredEvent[] = []
  const fileContents = commandFileContents || getCommandFileContents(commandName, rootPath)
  const eventStatements = [
    ...fileContents
      .toString()
      .matchAll(/new\s*(\w*)\(\n*.*\/\/\s*(@requiredInputs.*)\n*.*\/\/\s*(@aReducingEntity.*)/g),
  ]
  eventStatements.forEach((eventString) => {
    const thisEvent: RegisteredEvent = { input: {}, event: '', evaluatedEntity: '' }

    // create query variable string for event
    let inputs = {}
    const inputString = eventString[2].replace(/@requiredInputs:\s*|\s|{|}/g, '')
    const inputGroups = inputString.split(',') // capture multiple inputs if present
    inputGroups.forEach((input) => {
      const thisInput = {}
      let inputValue: string | number | boolean = input.split(':')[1].replace(/'/g, '').replace(/"/g, '')

      // create suitable example value if a generic label was used
      if (inputValue === 'string') inputValue = faker.random.word()
      if (inputValue === 'number') inputValue = faker.datatype.number()
      if (inputValue === 'boolean') inputValue = faker.datatype.boolean()
      if (inputValue === 'id') inputValue = faker.datatype.uuid()

      // add input name with value
      thisInput[input.split(':')[0]] = inputValue
      inputs = { ...inputs, ...thisInput }
    })
    thisEvent.input = inputs
    thisEvent.event = eventString[1]
    thisEvent.evaluatedEntity = eventString[3].replace(/@aReducingEntity:\s*/, '').replace(/'/g, '')
    registeredEvents.push(thisEvent)
  })
  return registeredEvents
}

export const createRegisteredEventsTests = (
  registeredEvents: RegisteredEvent[],
  commandMutation: DocumentNode,
  applicationUnderTest: ApplicationTester,
  graphQLclient: ApolloClient<NormalizedCacheObject>,
  resultWaitTime = 5000
): void => {
  registeredEvents.forEach(async (event) => {
    it(
      `should register the event: ${event.event}`,
      async () => {
        const check = await wasEventRegistered(commandMutation, event, applicationUnderTest, graphQLclient)
        expect(check).toBe(true)
        // console.log(`✅ [Command registers event: ${event.event}]`)
      },
      resultWaitTime + 500
    )
  })
}

export const wasEventRegistered = async (
  commandMutation: DocumentNode,
  registeredEvent: RegisteredEvent,
  applicationUnderTest: ApplicationTester,
  graphQLclient: ApolloClient<NormalizedCacheObject>,
  resultWaitTime = 5000
): Promise<boolean> => {
  // event store query expects primary key that matches `entityTypeName_entityID_kind` value
  const tid = registeredEvent.input?.tid || faker.datatype.uuid().toString() // test id input ('tid') is set to 'string' type to other accept custom values
  const primaryKey = `${registeredEvent.evaluatedEntity}-${tid}-event`

  // submit command
  const commandVariables = { tid, ...registeredEvent.input }
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
