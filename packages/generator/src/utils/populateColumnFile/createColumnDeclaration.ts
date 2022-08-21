import { DMMF } from '@prisma/generator-helper'
import { Config } from 'src/config'
import {
  OptionalKind,
  VariableDeclarationKind,
  VariableStatementStructure,
} from 'ts-morph'

export const getTSTypeFromFieldType = (type: string) => {
  switch (type) {
    case 'Int':
    case 'Decimal':
      return 'number'
    case 'Date':
      return 'date'
    case 'Boolean':
      return 'boolean'
    case 'String':
      return 'string'
    default:
      return 'relation'
  }
}

export const getCellNameByFieldType = (params: {
  config: Config
  type: string
}): string => {
  const { config, type } = params
  switch (type) {
    case 'Int':
    case 'Decimal':
      return config.cellNumberName
    case 'Date':
      return config.cellDateName
    case 'Boolean':
      return config.cellBooleanName
    case 'String':
      return config.cellStringName
    default:
      return config.cellRelationName
  }
}

export const createColumnDeclaration = (params: {
  config: Config
  name?: string
  model: DMMF.Model
  schema: { name: string; path: string }
}): OptionalKind<VariableStatementStructure>[] => {
  const { config, schema, name = 'getColumns', model } = params
  const relatedColumns = model.fields.filter((field) => !!field.relationName)

  const columns = model.fields.map((field) => {
    const { type } = field
    const filterTypeName = getTSTypeFromFieldType(type)
    const cellName = getCellNameByFieldType({ type, config })

    /** This is a single column declaration, add whatever you'd like to go in the columns here */
    return `
      h.accessor((${model.name}) => ${model.name}?.${field.name}, {
        ...${config.defaultColumnName},
        meta: {type: '${filterTypeName}'},
        id: '${field.name}',
        header: '${field.name}',
        cell: cells.${cellName}
      })
    `
  })

  /** Any column that has a relation that is a single relation */
  const columnsToResolve = relatedColumns.map((field) => {
    return `
      const ${field.type.toLowerCase()} = await import('./${field.type.toLowerCase()}.columns');
      const ${field.type.toLowerCase()}Columns = (await ${field.type.toLowerCase()}.getColumns<z.infer<typeof ${
      schema.name
    }>>({
        id: '${field.name}',
        accessorFn: (${model.name.toLowerCase()}) => ${model.name.toLowerCase()}?.${
      field.name
    },
      })) as AccessorFnColumnDef<any,any>[];
    `
  })

  // Resolve imports

  // Create Columns
  return [
    {
      declarationKind: VariableDeclarationKind.Const as const,
      leadingTrivia: (w) => w.blankLineIfLastNot(),
      isExported: true,
      declarations: [
        {
          name: 'resolveColumns',
          initializer(writer) {
            writer.write(`
async (resolve?: boolean): Promise<AccessorFnColumnDef<any,any>[]> => {
  if(!resolve) return [];
  ${columnsToResolve} 
  return [${relatedColumns
    .map((col) => `...${col.type.toLowerCase()}Columns`)
    .join(',')}]
}
          `)
          },
        },
      ],
    },
    {
      declarationKind: VariableDeclarationKind.Const as const,
      leadingTrivia: (w) => w.blankLineIfLastNot(),
      isExported: true,
      declarations: [
        {
          name,
          initializer(writer) {
            writer.write(`
            createColumns<z.infer<typeof ${schema?.name}>>(async(h, resolve) => ([
              ${columns},
              ...(await resolveColumns(resolve))
            ]))
          `)
          },
        },
      ],
    },
  ]
}
