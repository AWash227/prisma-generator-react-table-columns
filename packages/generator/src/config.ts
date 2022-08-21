import { z } from 'zod'

export const textBoolean = (def: 'true' | 'false' = 'false') =>
  z
    .enum(['true', 'false'])
    .default(def)
    .transform((value) => JSON.parse(value))

export const configSchema = z.object({
  iconImportPath: z.string().default('@mui/icons-material'),
  iconUseNamedImports: textBoolean('false'),

  cellImportPath: z.string().default('components/cells'),
  cellUseNamedImports: textBoolean('true'),

  defaultsImportPath: z.string().default('features/resource/defaults'),
  defaultColumnName: z.string().default('defaultColumn'),

  zodPrismaModelSuffix: z.string().default('Schema'),
  zodPrismaOutput: z.string().default('../_schemas'),

  cellStringName: z.string().default('TextCell'),
  cellNumberName: z.string().default('NumberCell'),
  cellDateName: z.string().default('DateCell'),
  cellBooleanName: z.string().default('BooleanCell'),
  cellRelationName: z.string().default('RelationCell'),
})

export type Config = z.infer<typeof configSchema>
