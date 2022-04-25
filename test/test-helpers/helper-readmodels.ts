import type { ApolloClient } from 'apollo-client'
import type { NormalizedCacheObject } from 'apollo-cache-inmemory'
import type { DocumentNode } from 'graphql'
import { applicationUnderTest } from '../test-helpers'
import { waitForIt, looseJSONparse, isStringJSON } from '.'
import { faker } from '@faker-js/faker'
import gql from 'graphql-tag'

// Read Model Test Mutation
// =====================================================================================================================

// Read Model Queries
// =====================================================================================================================

export interface fieldCheck {
  fieldName: string
  shouldContainValue: string | number | boolean
}

export const evaluateReadModelProjection = async (
  submitGraphQLclient: ApolloClient<NormalizedCacheObject>,
  commandMutation: DocumentNode,
  commandVariables: Record<string, unknown>,
  readGraphQLclient: ApolloClient<NormalizedCacheObject>,
  entityName: string,
  fieldsToCheck: fieldCheck[],
  sortBy?: Record<string, unknown>,
  limitResultsTo?: number,
  resultWaitTime = 5000
): Promise<Record<string, unknown>> => {
  // make test mutation for query
  const tid = commandVariables.tid || `${entityName}-read-model-test-id-${faker.datatype.number(100)}`
  const mutationVariables = { tid, ...commandVariables }
  await submitGraphQLclient.mutate({ mutation: commandMutation, variables: mutationVariables })

  // wait until mutation is processed
  const primaryKey = `${entityName}-${tid}-snapshot`
  try {
    await waitForIt(
      () => applicationUnderTest.query.events(primaryKey),
      (matches) => matches?.length > 0,
      500,
      resultWaitTime
    )
  } catch (error) {
    console.log(`💥 [Command did not do process request within ${resultWaitTime / 1000} seconds]`)
  }

  // evaluate read model projection
  const readModelName = `${entityName}ReadModel`

  // ...grab necessary fields to check
  const fieldNames = fieldsToCheck.map((field) => field.fieldName)
  const fieldsToReturn = [...fieldNames].join(',')

  // ...create filter string
  let filterString = '{ '
  fieldsToCheck.forEach((field) => {
    // currently limited to filters from strings, numbers, and booleans
    // JSON or stringified JSON value checks will be ignored
    if (typeof field.shouldContainValue === 'string' && !isStringJSON(field.shouldContainValue)) {
      filterString += `${field.fieldName}: { contains: "${field.shouldContainValue}" }, `
    }
    if (typeof field.shouldContainValue !== 'string') {
      filterString += `${field.fieldName}: { eq: ${field.shouldContainValue} }, `
    }
  })
  filterString += ' }'

  // ...build query
  const filterBy = looseJSONparse(filterString)
  const limitTo = limitResultsTo
  const queryVariables = createQueryVariables(filterBy, sortBy, limitTo)
  const connectionQuery = createReadModelQuery(readModelName, fieldsToReturn)

  // ...make query
  const { data } = await readGraphQLclient.query({ query: connectionQuery, variables: queryVariables })
  const items = data[`List${readModelName}s`].items

  return items
}

export const createQueryVariables = (
  filterBy?: Record<string, unknown>,
  sortBy?: Record<string, unknown>,
  limitTo?: number
): Record<string, unknown> => {
  return {
    filterBy,
    sortBy,
    limitTo,
  }
}

export const createReadModelQuery = (readModelName: string, fieldsToReturn?: string): DocumentNode => {
  const fields = fieldsToReturn ? fieldsToReturn : '__typename'
  return gql`
      query List${readModelName}s($filterBy: List${readModelName}Filter, $sortBy: ${readModelName}SortBy, $limitTo: Int) {
        List${readModelName}s(filter: $filterBy, sortBy: $sortBy, limit: $limitTo) {
          items {
            ${fields}
          }
        }
      }
    `
}
