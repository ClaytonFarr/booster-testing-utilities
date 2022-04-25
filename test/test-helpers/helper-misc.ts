// Miscellaneous Helpers
// ====================================================================================

export async function setEnvVar(VAR_NAME: string, varValue: string): Promise<void> {
  process.env[VAR_NAME] = varValue
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function waitForIt<TResult>(
  tryFunction: () => Promise<TResult>,
  checkResult: (result: TResult) => boolean,
  tryEveryMs = 1000,
  timeoutMs = 60000
): Promise<TResult> {
  const start = Date.now()
  return doWaitFor()

  async function doWaitFor(): Promise<TResult> {
    // console.debug('[waitForIt] Executing function')
    const res = await tryFunction()
    // console.debug('[waitForIt] Checking result')
    const expectedResult = checkResult(res)
    if (expectedResult) {
      // console.debug('[waitForIt] Result is expected. Wait finished.')
      return res
    }
    // console.debug('[waitForIt] Result is not expected. Keep trying...')
    const elapsed = Date.now() - start
    // console.debug('[waitForIt] Time elapsed (ms): ' + elapsed)

    if (elapsed > timeoutMs) {
      throw new Error('[waitForIt] Timeout reached waiting for a successful execution')
    }

    const nextExecutionDelay = (timeoutMs - elapsed) % tryEveryMs
    // console.debug('[waitForIt] Trying again in ' + nextExecutionDelay)
    await sleep(nextExecutionDelay)
    return doWaitFor()
  }
}

export const pascalToTitleCase = (str: string): string => str.replace(/([a-z])([A-Z])/g, '$1 $2')

export const camelToKebabCase = (str: string): string => str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()

export const isStringJSON = (testString: string): boolean => {
  try {
    JSON.parse(testString)
  } catch (e) {
    return false
  }
  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const looseJSONparse = (JSONstring: string): any => Function('"use strict";return (' + JSONstring + ')')()
