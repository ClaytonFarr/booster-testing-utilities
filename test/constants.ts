// `-test` suffix is appended to app name by test configuration environment
export const testApplicationName = process.env.BOOSTER_APP_NAME ? `${process.env.BOOSTER_APP_NAME}-test` : 'myapp-test'

export const fixturesPath = 'test/fixtures/'
