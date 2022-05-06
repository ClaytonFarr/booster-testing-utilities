import type { EventEnvelope, ReadModelEnvelope } from '@boostercloud/framework-types'
import * as util from './local-test-utilities'
import * as path from 'path'
import * as fs from 'fs'

export class LocalQueries {
  constructor(
    private readonly localFileStorePath = '.booster' //
  ) {}

  public async events(
    primaryKey: string, //
    latestFirst = true
  ): Promise<EventEnvelope[]> {
    // primaryKey notes
    // - event store query expects primary key to match `entityTypeName_entityID_kind` value for DynamoDB table lookup
    // - the local datastore does NOT include a field with a matching value; test values have to be derived from primaryKey

    // deconstruct primaryKey
    // - primaryKey format: {affectedEntityTypeName}-{entityID}-event|snapshot
    const entityTypeName = primaryKey.split('-')[0]
    const entityID = primaryKey.replace(`${entityTypeName}-`, '').replace('-event', '').replace('-snapshot', '')
    const entityKind = primaryKey.match(/-event|-snapshot/)[0].replace('-', '')

    // grab items
    let items: EventEnvelope[]
    const eventsFilePath = path.join(this.localFileStorePath, 'events.json')
    const data = fs.readFileSync(eventsFilePath, 'utf8')
    items = util.getLocalEventItems(data)

    // update sorting as needed
    if (!latestFirst) items = items.reverse()

    // filter items for request
    items = items.filter((item) => item.kind === entityKind) // filter by kind
    items = items.filter((item) => JSON.stringify(item).includes(entityID)) // filter by test ID
    items = items.filter((item) => item.entityTypeName.toLowerCase() === entityTypeName.toLowerCase()) // this entity type

    return items
  }

  public async readModels(
    primaryKey: string, //
    readModelName: string,
    latestFirst = true
  ): Promise<ReadModelEnvelope[]> {
    // primaryKey notes
    // - read model query expects primary key to match `id` value
    // - the local datastore DOES include an `id` field with same expected value

    // grab items
    let items: ReadModelEnvelope[]
    const eventsFilePath = path.join(this.localFileStorePath, 'read_models.json')
    const data = fs.readFileSync(eventsFilePath, 'utf8')
    items = util.getLocalReadModelItems(data)

    // update sorting as needed
    if (!latestFirst) items = items.reverse()

    // filter items for request
    items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(primaryKey.toLowerCase()))
    items = items.filter((item) => JSON.stringify(item).toLowerCase().includes(readModelName.toLowerCase()))
    return items
  }
}
