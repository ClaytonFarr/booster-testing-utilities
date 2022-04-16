import { Role } from '@boostercloud/framework-core'

@Role({
  auth: {
    signUpMethods: [],
  },
})
export class Mom {}

@Role({
  auth: {
    signUpMethods: [],
  },
})
export class Dad {}
