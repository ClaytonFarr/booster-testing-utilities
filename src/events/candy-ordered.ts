import { Event } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'

@Event
export class CandyOrdered {
  public constructor(
    readonly id: UUID, //
    readonly when: string,
    readonly rat: string
  ) {}

  public entityID(): UUID {
    return this.id
  }
}
