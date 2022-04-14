import { describe, it, expect } from 'vitest'
import * as helpers from '../../../src/common/helpers'

describe('validation', () => {
  it('confirms when JSON is valid', () => {
    const validJSON = '{"name":"John Doe"}'
    expect(helpers.isValidJSONString(validJSON)).toBe(true)
  })

  it('confirms when JSON is invalid', () => {
    const invalidJSON = 'John Doe'
    expect(helpers.isValidJSONString(invalidJSON)).toBe(false)
  })

  it('confirms when EMAIL is valid', () => {
    const validEmail = 'test@test.com'
    expect(helpers.validateEmailAddress(validEmail)).toBe(true)
  })

  it('confirms when EMAIL is invalid', () => {
    const invalidEmail = 'john.doe@'
    expect(helpers.validateEmailAddress(invalidEmail)).toBe(false)
  })
})

describe('delay', () => {
  it('waits requested number of seconds', () => {
    const start = Date.now()
    const seconds = 1
    return helpers.wait(seconds * 1000).then(() => {
      expect(Date.now() - start).toBeGreaterThanOrEqual(seconds * 1000)
    })
  })
})
