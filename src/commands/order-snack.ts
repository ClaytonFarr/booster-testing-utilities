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
    readonly fruit: string,
    readonly drink?: string, // @validExample: 'water'
    readonly id?: UUID // an optional ID param is included for tests
  ) {}

  public static async handle(command: OrderSnack, register: Register): Promise<void> {
    // check inputs
    if (!command.fruit || command.fruit === '') throw new Error('A fruit is required.')
    if (command.drink === '') throw new Error('If you want a drink, please tell us which type.')
    if (command.drink && command.drink !== 'water') throw new Error('How about some water instead?')

    const orderId = command.id || UUID.generate()
    const orderTakenBy = ['Cindy', 'John', 'Sue', 'Mike', 'Erik', 'Abi'][Math.floor(Math.random() * 6)]

    // do work
    // @work01: capitalize the 'fruit' value
    const capitalize = (s: string): string => s.charAt(0).toUpperCase() + s.slice(1)

    // register events
    register.events(
      new FruitOrdered(
        // @requiredInput: { fruit: string }
        // @aReducingEntity: 'Fruit'
        orderId,
        capitalize(command.fruit),
        orderTakenBy
      )
    )
    if (command.drink) {
      register.events(
        new DrinkOrdered(
          // @requiredInput: { fruit: string, drink: string }
          // @aReducingEntity: 'Drink'
          orderId,
          capitalize(command.drink),
          orderTakenBy
        )
      )
    }
    // @work02: tattle when candy is ordered
    if (command.fruit.toLowerCase() === 'candy') {
      register.events(
        new CandyOrdered(
          // @requiredInput: { fruit: 'candy' }
          // @aReducingEntity: 'Tattle'
          orderId,
          new Date().toISOString(),
          orderTakenBy
        )
      )
    }
  }
}

// @work01-inputs: { name: 'fruit', value: 'apple' }
// @work01-entity: 'Fruit'
// @work01-result: 'Apple'

// @work02-inputs: { name: 'fruit', value: 'candy' }
// @work02-entity: 'Tattle'
// @work02-result: true
