import { Role } from '@boostercloud/framework-core'

@Role({
  auth: {
    signUpMethods: ['email', 'phone'],
    skipConfirmation: true,
  },
})
export class Mom {}
