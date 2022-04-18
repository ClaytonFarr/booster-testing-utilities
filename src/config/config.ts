import { Booster } from '@boostercloud/framework-core'
import { BoosterConfig, Level } from '@boostercloud/framework-types'
import * as path from 'path'
import * as fs from 'fs'

const appName = process.env.BOOSTER_APP_NAME ?? 'myapp'

Booster.configure('local', (config: BoosterConfig): void => {
  config.appName = `${appName}-local`
  config.providerPackage = '@boostercloud/framework-provider-local'
  config.logLevel = Level.error
  // Testing JWT token verification: will read contents of public RS256 located at "<root>/keys/testing-public.key"
  // expects public key to be based on the private key used by Boost 'application-tester' tool
  // test private key: https://github.com/boostercloud/booster/blob/1024e7cb64222cbb9beda28ff29912530212a3f4/packages/application-tester/keys/private.key
  // paste private key into generator to create matching public key, if needed: https://cryptotools.net/rsagen
  config.tokenVerifiers = [
    {
      issuer: 'booster',
      publicKey: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'testing-public.key'), 'utf8'),
      rolesClaim: 'booster:role',
    },
    {
      issuer: 'booster',
      publicKey: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'testing-public.key'), 'utf8'),
      rolesClaim: 'booster:role',
      extraValidation: async () => {
        throw new Error('Unauthorized')
      },
    },
  ]
})

Booster.configure('test', (config: BoosterConfig): void => {
  config.appName = `${appName}-test`
  config.providerPackage = '@boostercloud/framework-provider-aws'
  // 'keys' directory needs to be included in deployed environments for testing to work properly
  config.assets = ['keys']
  config.tokenVerifiers = [
    {
      issuer: 'booster',
      publicKey: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'testing-public.key'), 'utf8'),
      rolesClaim: 'booster:role',
    },
    {
      issuer: 'booster',
      publicKey: fs.readFileSync(path.join(__dirname, '..', '..', 'keys', 'testing-public.key'), 'utf8'),
      rolesClaim: 'booster:role',
      extraValidation: async () => {
        throw new Error('Unauthorized')
      },
    },
  ]
})

Booster.configure('development', (config: BoosterConfig): void => {
  config.appName = `${appName}-dev`
  config.providerPackage = '@boostercloud/framework-provider-aws'
  config.assets = ['keys']
})

Booster.configure('production', (config: BoosterConfig): void => {
  config.appName = `${appName}-prod`
  config.providerPackage = '@boostercloud/framework-provider-aws'
  config.assets = ['keys']
})
