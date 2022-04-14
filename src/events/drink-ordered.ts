import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class DrinkOrdered {
  public constructor(
    readonly id: UUID, //
    readonly drink: string,
    readonly orderTakenBy: string
  ) {}

  public entityID(): UUID {
    return this.id
  }
}
