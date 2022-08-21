import { Project } from 'ts-morph'

export const createFileParams = (
  pathName: string,
): Parameters<Project['createSourceFile']> => [
  pathName,
  undefined,
  { overwrite: true },
]
