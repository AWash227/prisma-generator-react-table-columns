import { DMMF } from '@prisma/generator-helper'
import { Config } from 'src/config'
import { SourceFile } from 'ts-morph'
import { createImport } from '../createImport'
import { createColumnDeclaration } from './createColumnDeclaration'

export const populateColumnFile = (params: {
  model: DMMF.Model
  file: SourceFile
  config: Config
  schema: { name: string; path: string }
}) => {
  const { file, model, schema, config } = params

  file.addImportDeclarations([
    createImport(['z'], 'zod'),
    createImport(['AccessorFnColumnDef'], '@tanstack/react-table'),
    createImport('* as cells', config.cellImportPath),
    createImport(['createColumns', config.defaultColumnName], './_helpers'),
    ...(schema ? [createImport([schema.name], schema.path)] : []),
  ])

  file.addVariableStatements(
    createColumnDeclaration({
      config,
      model,
      schema,
    }),
  )
}
