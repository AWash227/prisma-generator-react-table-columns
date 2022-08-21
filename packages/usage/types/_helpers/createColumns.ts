import { ColumnHelper, createColumnHelper } from '@tanstack/react-table'

export const createColumns =
  <TColumnHelper = unknown>(
    createColumn: (
      h: ColumnHelper<TColumnHelper>,
      resolve?: boolean,
    ) => Promise<any[]>,
  ) =>
  async <TParentObject = unknown, TResolvedValue = unknown>(params?: {
    accessorFn?: (obj: TParentObject) => TResolvedValue
    id?: keyof TParentObject
    resolve?: boolean
  }) => {
    const { accessorFn, resolve = false, id } = params ?? { resolve: false }
    const h = createColumnHelper<TColumnHelper>()
    const cols = await createColumn(h, resolve)
    if (!accessorFn) return cols
    return cols.map((col) => ({
      ...col,
      ...(accessorFn && {
        accessorFn: (obj: any) => col.accessorFn(accessorFn(obj)),
      }),
      ...(id && { id: `${String(id)}.${col.id}` }),
    }))
  }
