import { ReadModel, Projects } from '@boostercloud/framework-core'
import { UUID, ProjectionResult } from '@boostercloud/framework-types'
import { Fruit } from '../entities/fruit'

@ReadModel({
  authorize: 'all',
})
export class FruitReadModel {
  public constructor(
    public id: UUID, //
    public fruit: string,
    public orderTakenBy: string
  ) {}

  @Projects(Fruit, 'id')
  public static projectFruit(
    entity: Fruit //
    // current?: FruitReadModel
  ): ProjectionResult<FruitReadModel> {
    return new FruitReadModel(
      entity.id, //
      entity.fruit,
      entity.orderTakenBy
    )
  }
}
