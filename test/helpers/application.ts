// Imports
// ====================================================================================

import ApolloClient from 'apollo-client'
import { NormalizedCacheObject } from 'apollo-cache-inmemory'
import { UUID } from '@boostercloud/framework-types'
import gql from 'graphql-tag'

// Commands
// ====================================================================================

export async function orderSnack(
  client: ApolloClient<NormalizedCacheObject>,
  fruit: string,
  drink?: string,
  id?: UUID
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  return client.mutate({
    variables: {
      fruit,
      drink,
      id,
    },
    mutation: gql`
      mutation OrderSnack($fruit: String!, $drink: String, $id: ID) {
        OrderSnack(input: { fruit: $fruit, drink: $drink, id: $id })
      }
    `,
  })
}
