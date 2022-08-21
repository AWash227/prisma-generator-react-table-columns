import { z } from 'zod'

export const getDocParam =
  <T = unknown>(param: string, callback: (str?: string) => T) =>
  (docString: string) => {
    const lines = docString.split('\n') // We have each line
    const indexes = lines.map((line) => line.indexOf(param))
    const item = lines
      .filter((_, i) => indexes[i] !== -1) // We have filtered the lines by our param
      .map((line, i) => {
        const value = line.slice(indexes[i]).split(' ')[1]
        return value
      })
      .pop()

    return callback(item)
  }

export const getAllDocParams = (docString: string) => {
  return {
    cell: getCell(docString),
    icon: getIcon(docString),
    skip: getSkip(docString),
    currency: getCurrency(docString),
    prettyName: getPrettyName(docString),
  }
}

export const getCell = getDocParam('@cell', (str) => {
  if (!str) return undefined
  return str
})
export const getIcon = getDocParam('@icon', (str) => {
  if (!str) return undefined
  return str
})
export const getSkip = getDocParam('@skip', (str) => {
  if (!str) return undefined
  return z
    .enum(['true', 'false'])
    .transform((val) => JSON.parse(val))
    .parse(str)
})
export const getCurrency = getDocParam('@currency', (str) => {
  if (!str) return undefined
  return z
    .enum(['true', 'false'])
    .transform((val) => JSON.parse(val))
    .parse(str)
})
export const getPrettyName = getDocParam('@pretty', (str) => {
  if (!str) return undefined
  return str
})
