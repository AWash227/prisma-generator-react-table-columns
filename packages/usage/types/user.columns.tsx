import { z } from 'zod'
import { AccessorFnColumnDef } from '@tanstack/react-table'
import * as cells from 'components/cells'
import { createColumns, defaultColumn } from './_helpers'
import { RelatedUserSchema } from '../_schemas'

export const resolveColumns = async (
  resolve?: boolean,
): Promise<AccessorFnColumnDef<any, any>[]> => {
  if (!resolve) return []

  return []
}

export const getColumns = createColumns<z.infer<typeof RelatedUserSchema>>(
  async (h, resolve) => [
    h.accessor((User) => User?.id, {
      ...defaultColumn,
      meta: { type: 'number' },
      id: 'id',
      header: 'id',
      cell: cells.NumberCell,
    }),
    h.accessor((User) => User?.email, {
      ...defaultColumn,
      meta: { type: 'string' },
      id: 'email',
      header: 'email',
      cell: cells.TextCell,
    }),
    h.accessor((User) => User?.name, {
      ...defaultColumn,
      meta: { type: 'string' },
      id: 'name',
      header: 'name',
      cell: cells.TextCell,
    }),
    ...(await resolveColumns(resolve)),
  ],
)
