import type { EventEnvelope, ReadModelEnvelope } from '@boostercloud/framework-types'
import * as path from 'path'
import * as fs from 'fs'

export function backupLocalDatastores(localFileStorePath = '.booster', backupSuffix = 'bak'): void {
  // backup each file within local datastore folder
  const files = fs.readdirSync(localFileStorePath)
  files.map((file) => {
    const filePath = path.join(localFileStorePath, file)
    fs.copyFileSync(filePath, `${filePath}.${backupSuffix}`)
  })
}

export function restoreLocalDatastores(localFileStorePath = '.booster', backupSuffix = 'bak'): void {
  const files = fs.readdirSync(localFileStorePath)
  // remove updated datastore files (files without backup suffix)
  files.map((file) => {
    if (!file.includes(backupSuffix)) {
      const filePathName = path.join(localFileStorePath, file)
      fs.unlinkSync(filePathName)
    }
  })
  // restore original datastore files (by renaming them back to original file names)
  files.map((file) => {
    if (file.includes(backupSuffix)) {
      const filePathName = path.join(localFileStorePath, file)
      fs.renameSync(filePathName, filePathName.replace(`.${backupSuffix}`, ''))
    }
  })
}

export function convertLocalDatastoreToJSON(data: string): string {
  const result = { items: [] }
  const regex = /^.*$/gm // datastore keeps items on new lines
  const items = data?.toString().match(regex)
  items.pop() // datastore keeps empty line at end of file
  items.forEach((item) => result.items.push(JSON.parse(item)))
  return JSON.stringify(result)
}

export function getLocalDatastoreItems(data: string): Record<string, unknown>[] {
  const eventsAsJSON = convertLocalDatastoreToJSON(data)
  const parsedJSON = JSON.parse(eventsAsJSON)
  return parsedJSON.items
}

export function getLocalEventItems(data: string): EventEnvelope[] {
  const eventsAsJSON = convertLocalDatastoreToJSON(data)
  const parsedJSON = JSON.parse(eventsAsJSON)
  return parsedJSON.items
}

export function getLocalReadModelItems(data: string): ReadModelEnvelope[] {
  const readModelsAsJSON = convertLocalDatastoreToJSON(data)
  const parsedJSON = JSON.parse(readModelsAsJSON)
  return parsedJSON.items
}
