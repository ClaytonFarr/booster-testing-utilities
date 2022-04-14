import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class FruitOrdered {
  public constructor(
    readonly id: UUID, //
    readonly fruit: string,
    readonly orderTakenBy: string
  ) {}

  public entityID(): UUID {
    return this.id
  }
}
