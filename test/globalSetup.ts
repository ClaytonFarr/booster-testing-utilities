import { backupLocalDatastores, restoreLocalDatastores } from './helpers/custom-local-test-helper'

export async function setup(): Promise<void> {
  // local tests setup
  if (process.env.TESTED_PROVIDER === 'LOCAL') {
    // backup existing local datastores before running tests
    backupLocalDatastores()
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
    restoreLocalDatastores()
  }

  // deployed tests tear down
  if (process.env.TESTED_PROVIDER === 'AWS') {
    //
  }
}
