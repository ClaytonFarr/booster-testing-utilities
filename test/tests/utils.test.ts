import { describe, it, expect } from 'vitest'
import * as utils from '../../src/common/utils'

describe('validation', () => {
  it('confirms when JSON is valid', () => {
    const validJSON = '{"name":"John Doe"}'
    expect(utils.isValidJSONString(validJSON)).toBe(true)
  })

  it('confirms when JSON is invalid', () => {
    const invalidJSON = 'John Doe'
    expect(utils.isValidJSONString(invalidJSON)).toBe(false)
  })

  it('confirms when EMAIL is valid', () => {
    const validEmail = 'test@test.com'
    expect(utils.validateEmailAddress(validEmail)).toBe(true)
  })

  it('confirms when EMAIL is invalid', () => {
    const invalidEmail = 'john.doe@'
    expect(utils.validateEmailAddress(invalidEmail)).toBe(false)
  })
})

describe.skip('delay', () => {
  it('waits requested number of seconds', () => {
    const start = Date.now()
    const seconds = 1
    return utils.wait(seconds * 1000).then(() => {
      expect(Date.now() - start).toBeGreaterThanOrEqual(seconds * 1000)
    })
  })
})
