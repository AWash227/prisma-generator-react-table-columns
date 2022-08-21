import {
  OptionalKind,
  VariableDeclarationKind,
  VariableStatementStructure,
} from 'ts-morph'

export const createColumnHelperDeclaration = (
  name: string,
  TSchema: string,
): OptionalKind<VariableStatementStructure> => ({
  declarationKind: VariableDeclarationKind.Const as const,
  leadingTrivia: (w) => w.blankLineIfLastNot(),
  declarations: [
    {
      name,
      initializer(w) {
        w.write(`createColumnHelper<z.infer<typeof ${TSchema}>>()`)
      },
    },
  ],
})
