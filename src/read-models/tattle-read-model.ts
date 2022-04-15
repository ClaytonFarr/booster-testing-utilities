import { ReadModel, Projects } from '@boostercloud/framework-core'
import { UUID, ProjectionResult } from '@boostercloud/framework-types'
import { Tattle } from '../entities/tattle'
import { Mom } from '../roles'

@ReadModel({
  authorize: [Mom],
})
export class TattleReadModel {
  public constructor(
    public id: UUID, //
    public when: string
  ) {}

  @Projects(Tattle, 'id')
  public static projectTattle(
    entity: Tattle //
    // current?: TattleReadModel
  ): ProjectionResult<TattleReadModel> {
    return new TattleReadModel(
      entity.id, //
      entity.when
    )
  }
}
