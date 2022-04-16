// Imports
// ====================================================================================

import { ApplicationTester, ProviderTestHelper } from '@boostercloud/application-tester'
import { AWSTestHelper } from '@boostercloud/framework-provider-aws-infrastructure'
import { ApolloClient } from 'apollo-client'
import { faker } from '@faker-js/faker'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import CustomLocalTestHelper from './custom-local-test-helper/local-test-helper'
import { testApplicationName } from '../constants'

// Test Infrastructure Setup
// ====================================================================================

// create test application based on environment variable passed to test
export async function getProviderTestHelper(): Promise<ProviderTestHelper> {
  const provider = process.env.TESTED_PROVIDER
  if (provider === 'LOCAL') return CustomLocalTestHelper.build() // applicationName not relevant locally; can pass custom path for local file store
  if (provider === 'AWS') return AWSTestHelper.build(testApplicationName)
  if (!provider) throw new Error("Environment variable 'TESTED_PROVIDER' not defined - can be 'LOCAL' or 'AWS'")
}
export async function getApplicationUnderTest(): Promise<ApplicationTester> {
  return new ApplicationTester(await getProviderTestHelper())
}
export const applicationUnderTest = await getApplicationUnderTest()

// create graphQL client for test
export async function createGraphQLClient(
  applicationUnderTest: ApplicationTester,
  authToken?: string
): Promise<ApolloClient<NormalizedCacheObject>> {
  return applicationUnderTest.graphql.client(authToken)
}

export const unAuthGraphQLclient = await createGraphQLClient(applicationUnderTest)

export const authGraphQLclient = (role: string): ApolloClient<NormalizedCacheObject> => {
  const roleEmail = faker.internet.email()
  const roleToken = applicationUnderTest.token.forUser(roleEmail, role)
  const roleGraphQLclient = applicationUnderTest.graphql.client(roleToken)
  return roleGraphQLclient
}
