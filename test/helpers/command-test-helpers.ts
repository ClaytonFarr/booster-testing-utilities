import type { DocumentNode } from 'graphql'
import { faker } from '@faker-js/faker'
import gql from 'graphql-tag'

// Command Parameters
// =====================================================================================================================

export interface Parameter {
  name: string
  type: string
  required?: boolean
}

export const getAcceptedParameterNames = (expectedParameters: Parameter[]): string[] =>
  expectedParameters.map(({ name }) => name)

// Generate Parameter Variable Options
// ---------------------------------------------------------------------------------------------------------------------

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

// Registered Events
// =====================================================================================================================

export interface RegisteredEvent {
  input: Record<string, unknown>
  event: string
  reducingEntity: string
}

export const getRegisteredEventNames = (events: RegisteredEvent[]): string[] => events.map(({ event }) => event)
