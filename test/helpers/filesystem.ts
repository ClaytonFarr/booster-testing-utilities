// Imports
// ------------------------------------------------------------------------------------

import * as fs from 'fs'
import { fixturesPath } from '../constants'

// File Management
// ====================================================================================

export const fileExists = fs.existsSync
export const readFileContent = (filePath: string, encoding?: 'utf8'): string => fs.readFileSync(filePath, encoding)
export const writeFileContent = (filePath: string, data: string): void => fs.writeFileSync(filePath, data)
export const backupFile = (filePath: string, suffix?: 'bak'): void => fs.copyFileSync(filePath, `${filePath}.${suffix}`)
export const renameFile = (oldPath: string, newPath: string): void => fs.renameSync(oldPath, newPath)
export const removeFiles = (filePaths: Array<string>, ignoreErrors = false): void => {
  filePaths.map((file: string) => {
    try {
      fs.unlinkSync(file)
    } catch (e) {
      if (!ignoreErrors) throw e
    }
  })
}
export const folderContents = fs.readdirSync
export const createFolder = (folder: string): void => {
  if (!fs.existsSync(folder)) fs.mkdirSync(folder)
}
export const removeFolders = (paths: Array<string>): void => {
  paths.map((path: string) => fs.rmSync(path, { recursive: true, force: true }))
}

// Fixture Helpers
// ====================================================================================

export const loadFixture = (fixturePath: string, replacements?: Array<Array<string>>): string => {
  const template = readFileContent(`${fixturesPath}/${fixturePath}`)
  return (
    replacements?.reduce(
      (prevContents: string, replacement: string[]): string => prevContents.split(replacement[0]).join(replacement[1]),
      template
    ) ?? template
  )
}
