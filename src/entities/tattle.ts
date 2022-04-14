import { Entity, Reduces } from '@boostercloud/framework-core'
import { UUID } from '@boostercloud/framework-types'
import { CandyOrdered } from '../events/candy-ordered'

@Entity
export class Tattle {
  public constructor(
    public id: UUID, //
    public when: string,
    public rat: string
  ) {}

  @Reduces(CandyOrdered)
  public static reduceCandyOrdered(
    event: CandyOrdered //
    // current?: Tattle
  ): Tattle {
    return new Tattle(
      event.id, //
      event.when,
      event.rat
    )
  }
}
