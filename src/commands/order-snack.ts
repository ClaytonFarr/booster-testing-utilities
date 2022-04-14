import { Register, UUID } from '@boostercloud/framework-types'
import { Command } from '@boostercloud/framework-core'
import { FruitOrdered } from '../events/fruit-ordered'
import { DrinkOrdered } from '../events/drink-ordered'
import { CandyOrdered } from '../events/candy-ordered'

@Command({
  authorize: 'all',
})
export class OrderSnack {
  public constructor(
    readonly fruit: string, //
    readonly drink?: string,
    readonly id?: UUID // optional ID param for integration tests
  ) {}

  public static async handle(command: OrderSnack, register: Register): Promise<void> {
    // check inputs
    if (!command.fruit || command.fruit === '') throw new Error('A fruit is required.')
    if (command.drink === '') throw new Error('If you want a drink, please tell us which type.')

    // do work
    const orderId = command.id || UUID.generate()
    const orderTakenBy = ['John', 'Jane', 'Jack', 'Jill'][Math.floor(Math.random() * 4)]

    // register event
    register.events(
      new FruitOrdered(
        orderId, //
        command.fruit,
        orderTakenBy
      )
    )
    if (command.drink) {
      register.events(
        new DrinkOrdered(
          orderId, //
          command.drink,
          orderTakenBy
        )
      )
    }
    if (command.fruit === 'candy') {
      register.events(
        new CandyOrdered(
          orderId, //
          new Date().toISOString(),
          orderTakenBy
        )
      )
    }
  }
}
