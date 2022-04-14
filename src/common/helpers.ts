// Validate JSON
// ------------------------------------------------------------------------------------
export function isValidJSONString(str: string): boolean {
  try {
    JSON.parse(str)
  } catch (e) {
    return false
  }
  return true
}

// Validate Email
// ------------------------------------------------------------------------------------
export const validateEmailAddress = (email: string): boolean => {
  const re =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return re.test(String(email).toLowerCase())
}

// Delay
// https://github.com/wesbos/waait)
// ------------------------------------------------------------------------------------
export const wait = (amount = 0): Promise<unknown> => new Promise((resolve) => setTimeout(resolve, amount))
// returns promise that resolves after how X milliseconds; e.g. -
// async function doStuff() {
//  doSomething();
//  await wait();
//  doSomethingElse();
//  await wait(200);
//  console.log('200ms later');
// }
