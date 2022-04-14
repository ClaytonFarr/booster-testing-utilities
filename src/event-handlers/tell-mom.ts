import { EventHandler } from '@boostercloud/framework-core'
import { Register } from '@boostercloud/framework-types'
import { CandyOrdered } from '../events/candy-ordered'

@EventHandler(CandyOrdered)
export class TellMom {
  public static async handle(event: CandyOrdered, register: Register): Promise<void> {
    const time = new Date(event.when).toLocaleTimeString()
    console.log(`I'm telling mom you asked for candy at ${time} - ${event.rat}`)
  }
}
