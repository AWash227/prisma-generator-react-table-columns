import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper'
import { logger } from '@prisma/sdk'
import { Project, StructureKind } from 'ts-morph'
import { configSchema } from './config'
import { GENERATOR_NAME } from './constants'
import { createFileParams } from './helpers/createFileParams'
import { formatFile } from './utils/formatFile'
import { populateColumnFile } from './utils/populateColumnFile'

const { version } = require('../package.json')

generatorHandler({
  onManifest() {
    logger.info(`${GENERATOR_NAME}:Registered`)
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const project = new Project({ skipAddingFilesFromTsConfig: true })
    const results = configSchema.safeParse(options.generator.config)
    if (!results.success)
      throw new Error(
        'Incorrect config provided. Please check the values you provided and try again.',
      )

    const config = results.data

    const outputPath = options.generator.output?.value
    const models = options.dmmf.datamodel.models

    const defaultsFileParams = createFileParams(
      `${outputPath}/_helpers/defaults.ts`,
    )
    const defaultsFile = project.createSourceFile(...defaultsFileParams)
    defaultsFile.addExportDeclaration({
      kind: StructureKind.ExportDeclaration,
      moduleSpecifier: config.defaultsImportPath,
      namedExports: [config.defaultColumnName],
    })

    models.forEach((model) => {
      const fileParams = createFileParams(
        `${outputPath}/${model.name.toLowerCase()}.columns.tsx`,
      )
      const file = project.createSourceFile(...fileParams)
      const schema = {
        name: `Related${model.name}${config.zodPrismaModelSuffix}`,
        path: config.zodPrismaOutput,
      }

      populateColumnFile({ file, model, schema, config })
    })
    project.createSourceFile(
      `${outputPath}/_helpers/createColumns.ts`,
      (w) => {
        w.write(`
import { ColumnHelper, createColumnHelper } from "@tanstack/react-table";

export const createColumns =
  <TColumnHelper = unknown>(
    createColumn: (
      h: ColumnHelper<TColumnHelper>,
      resolve?: boolean
    ) => Promise<any[]>
  ) =>
  async <TParentObject = unknown, TResolvedValue = unknown>(params?: {
    accessorFn?: (obj: TParentObject) => TResolvedValue;
    id?: keyof TParentObject;
    resolve?: boolean;
  }) => {
    const { accessorFn, resolve = false, id } = params ?? { resolve: false };
    const h = createColumnHelper<TColumnHelper>();
    const cols = await createColumn(h, resolve);
    if (!accessorFn) return cols;
    return cols.map((col) => ({
      ...col,
      ...(accessorFn && {
        accessorFn: (obj: any) => col.accessorFn(accessorFn(obj)),
      }),
      ...(id && { id: \`\${String(id)}.\${col.id}\` }),
    }));
  };
      `)
      },
      { overwrite: true },
    )

    const helpersBarrelFileParams = createFileParams(
      `${outputPath}/_helpers/index.ts`,
    )
    const helpersBarrelFile = project.createSourceFile(
      ...helpersBarrelFileParams,
    )

    helpersBarrelFile.addStatements((w) => {
      w.write(`
      export * from './createColumns';
      export * from './defaults';
      `)
    })

    const formattedFiles = await Promise.all(
      project.getSourceFiles().map(async (f) => ({
        file: await formatFile(f.getText(true)),
        path: f.getFilePath(),
      })),
    )
    const formattedProject = new Project({ skipAddingFilesFromTsConfig: true })
    formattedFiles.forEach((file) =>
      formattedProject.createSourceFile(file.path, file.file, {
        overwrite: true,
      }),
    )

    await formattedProject.save()
  },
})
