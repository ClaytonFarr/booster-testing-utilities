import * as helpers from './helpers'

export async function setup(): Promise<void> {
  // local tests setup
  if (process.env.TESTED_PROVIDER === 'LOCAL') {
    // backup existing local datastores before running tests
    helpers.backupLocalDatastores()
  }

  // deployed tests setup
  if (process.env.TESTED_PROVIDER === 'AWS') {
    //
  }
}

export async function teardown(): Promise<void> {
  // local tests tear down
  if (process.env.TESTED_PROVIDER === 'LOCAL') {
    // remove updated datastore files & restore original datastore files
    helpers.restoreLocalDatastores()
  }

  // deployed tests tear down
  if (process.env.TESTED_PROVIDER === 'AWS') {
    //
  }
}
