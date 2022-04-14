import * as fs from 'fs'
import * as path from 'path'
import * as util from './local-test-utilities'

export class LocalCounters {
  constructor(
    private readonly localFileStorePath = '.booster' //
  ) {}

  public async subscriptions(): Promise<number> {
    return this.countTableItems(path.join(this.localFileStorePath, 'subscriptions-store.json'))
  }

  public async connections(): Promise<number> {
    return this.countTableItems(path.join(this.localFileStorePath, 'connections-store.json'))
  }

  public async events(): Promise<number> {
    return this.countTableItems(path.join(this.localFileStorePath, 'events.json'))
  }

  public async readModels(readModelName: string): Promise<number> {
    return this.countTableItems(path.join(this.localFileStorePath, 'read_models.json'), readModelName)
  }

  private async countTableItems(filePath: string, searchTerm?: string): Promise<number> {
    let items: Record<string, unknown>[]
    const data = fs.readFileSync(filePath, 'utf8')
    items = util.getLocalDatastoreItems(data)
    if (searchTerm)
      items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(searchTerm.toLowerCase()))
    const itemCount = items.length
    return itemCount
  }
}
