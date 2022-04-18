import { describe, it, expect } from 'vitest'

describe('Suite...', async () => {
  // ORDER SNACK PROCESS
  // <anyone> should be able to SUBMIT
  // - a fruit
  // - an optional drink
  // app should DO WORK to
  // - capitalize fruit name
  // - capitalize drink name
  // - if 'candy' was requested for fruit - make <tattle> to Mom
  // app should TRACK
  // - <fruit>: name, when, who took order
  // - <drink>: name, when, who took order
  // - <tattle>: when, who tattled
  // <anyone> should be able to VIEW
  // - what fruits have been ordered, when, and who took order
  // - what drinks have been ordered, when, and who took order
  // <Mom> should be able to VIEW
  // - when candy was requested

  it('Test...', async () => {
    const thing = true
    expect(thing).toBe(true)

    // AUTHORIZATION & REQUEST OPTIONS
    // expect anyone to be able to submit request with only fruit
    // expect anyone to be able to submit request with fruit and drink

    // WORK DONE
    // expect fruit name to be capitalized
    // expect drink name to be capitalized
    // expect if 'candy' was requested for fruit - a tattle to occur

    // DATA SAVED
    // expect fruit order to include name, when, who took order
    // expect drink order to include name, when, who took order
    // expect tattle to include when, who tattled

    // DATA ACCESS / VISIBILITY
    // expect anyone to be able to view what fruits have ordered and who took each order
    // expect anyone to be able to view what drinks have ordered and who took each order
    // expect mom to be able to view when candy was requested
  })
})
