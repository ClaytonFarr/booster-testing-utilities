import { describe, it, expect } from 'vitest'

describe('Suite...', async () => {
  // ORDER SNACK
  // anyone should be able to submit
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

  // INSTALL APPLICATION
  // <anyone> should be able to SUBMIT
  // - a Hubspot install code
  // app should DO WORK to
  // - attempt to exchange code for connection's auth tokens
  //   & retrieve Hubspot ID & email from received token
  // - create or update <connection> with received ID and auth tokens
  // - create or update <account> for user with Hubspot ID & email
  // - if new account, create <scoring model> with default values
  // app should TRACK
  // - <connection>: auth tokens & ID
  // - <account>: Hubspot ID (as account ID) & email
  // - <scoring model>: measured parameters & weights
  // <user> should be able to VIEW
  // - nothing

  // UPDATE SCORING MODEL
  // <user> should be able to SUBMIT
  // - update to model parameters
  // - update to model parameters' weights
  // app should DO WORK to
  // - update <scoring model> with new parameters and weights
  // app should TRACK
  // - <scoring model>: parameters & weights
  // <user> should be able to VIEW
  // - <scoring model>: parameters & weights

  // CREATE NEW SCORING MODEL
  // <user> should be able to SUBMIT
  // - model name
  // - model description
  // - model parameters
  // - model parameters' weights
  // app should DO WORK to
  // - create <scoring model> with submitted parameters & weights
  // app should TRACK
  // - <scoring model>: parameters & weights
  // <user> should be able to VIEW
  // - <scoring model>: parameters & weights

  // ARCHIVE SCORING MODEL
  // <user> should be able to SUBMIT
  // - selected model
  // app should DO WORK to
  // - archive selected <scoring model>
  // app should TRACK
  // - <scoring model>: status
  // <user> should be able to VIEW
  // - request result

  // DELETE SCORING MODEL
  // <user> should be able to SUBMIT
  // - selected model
  // app should DO WORK to
  // - delete selected <scoring model>
  // <user> should be able to VIEW
  // - request result

  // CALCULATE CONTACT SCORES
  // each <day> should SUBMIT
  // - request to calculate scores for all contacts
  // <user> should be able to SUBMIT
  // - request to calculate score(s) for 1 or all contacts
  // app should DO WORK to
  // - retrieve all contacts for account from Hubspot
  // - calculate score(s) for each <contact> using saved <scoring models>
  // - update contact's scores in Hubspot
  // - send <notification> to user when scoring completed
  // app should TRACK
  // - <contacts>: Hubspot ID, score(s)
  // - <notification>: request, result, dateTime
  // <user> should be able to VIEW
  // - request result

  // VIEW CONTACT SCORES
  // <user> should be able to SUBMIT
  // - request to view score(s) for 1 or all contacts
  // app should DO WORK to
  // - retrieve scores for submitted <contacts>
  // app should TRACK
  // - <contacts>: Hubspot ID, score(s)
  // <user> should be able to VIEW
  // - contact score(s)

  it('Test...', async () => {
    const thing = true
    expect(thing).toBe(true)
  })
})
