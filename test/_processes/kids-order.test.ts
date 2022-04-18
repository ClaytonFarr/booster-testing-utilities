import { describe, it, expect } from 'vitest'

describe('Suite...', async () => {
  // anyone should be able to submit an order for
  // - a fruit
  // - an optional drink
  // app should do work to
  // - capitalize fruit name
  // - capitalize drink name
  // - check if 'candy' was requested for fruit - and if so, notify Mom
  // app should track
  // - what was ordered
  // - when order was placed
  // - who took order
  // - who tattled to Mom about candy
  // anyone should be able to view
  // - what was ordered
  // - who took order
  // Mom should be able to view
  // - when candy was requested

  // anyone should be able to submit
  // - a Hubspot install code
  // app should do work to
  // - check if install code is valid
  // - if valid,
  //   - retrieve Hubspot auth tokens
  //   - retrieve meta data for Hubspot account (account ID & email)
  //   - create or reactivate an account for the user
  //   - ...
  // app should track
  // - Hubspot auth tokens
  // - Hubspot account ID
  // - Hubspot email
  // user should be able to view
  // - ...

  // anyone should be able to submit
  // - a Hubspot install code
  // app should do work to
  // - attempt to exchange code with Hubspot for auth tokens
  // - attempt to retrieve meta data from token (Hubspot ID & email)
  // - attempt to retrieve account's current contacts
  //   - ...
  // app should track/know
  // - Hubspot auth tokens
  // - Hubspot account ID
  // - Hubspot email
  // user should be able to view/access
  // - ...

  it('Test...', async () => {
    const thing = true
    expect(thing).toBe(true)
  })
})
