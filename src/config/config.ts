import { Booster } from '@boostercloud/framework-core'
import { BoosterConfig, Level } from '@boostercloud/framework-types'

const appName = process.env.BOOSTER_APP_NAME ?? 'myapp'

Booster.configure('local', (config: BoosterConfig): void => {
  config.appName = `${appName}-local`
  config.providerPackage = '@boostercloud/framework-provider-local'
  config.logLevel = Level.error
})

Booster.configure('test', (config: BoosterConfig): void => {
  config.appName = `${appName}-test`
  config.providerPackage = '@boostercloud/framework-provider-aws'
})

Booster.configure('development', (config: BoosterConfig): void => {
  config.appName = `${appName}-dev`
  config.providerPackage = '@boostercloud/framework-provider-aws'
})

Booster.configure('production', (config: BoosterConfig): void => {
  config.appName = `${appName}-prod`
  config.providerPackage = '@boostercloud/framework-provider-aws'
})
