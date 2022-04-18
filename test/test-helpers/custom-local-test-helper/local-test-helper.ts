import { LocalQueries } from './local-queries'
import { LocalCounters } from './local-counters'
import { request } from 'graphql-request'

interface ApplicationOutputs {
  graphqlURL: string
  websocketURL: string
}

export default class CustomLocalTestHelper {
  public constructor(
    readonly outputs: ApplicationOutputs,
    readonly counters: LocalCounters,
    readonly queries: LocalQueries
  ) {}

  public static async build(localFileStorePath?: string, localServerPort?: number): Promise<CustomLocalTestHelper> {
    await this.ensureProviderIsReady()
    return new CustomLocalTestHelper(
      {
        graphqlURL: this.graphqlURL(localServerPort),
        websocketURL: this.websocketURL(),
      },
      new LocalCounters(localFileStorePath),
      new LocalQueries(localFileStorePath)
    )
  }

  private static async ensureProviderIsReady(): Promise<boolean> {
    // check response from local server and wait until it is ready
    const checkQuery = 'query { __typename }'
    const check = await request(this.graphqlURL(), checkQuery)
    if (check.__typename) return
    else throw new Error('Local server not responding. Ensure it has started before running tests.')
  }

  private static graphqlURL(serverPort = 3000): string {
    return `http://localhost:${serverPort}/graphql`
  }

  private static websocketURL(serverPort = 3333): string {
    serverPort
    return 'method not yet implemented'
  }
}
