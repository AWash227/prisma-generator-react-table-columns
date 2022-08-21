import {
  ImportDeclarationStructure,
  OptionalKind,
  StructureKind,
} from 'ts-morph'

export const createImport = (
  imports: string | string[],
  module: string,
): OptionalKind<ImportDeclarationStructure> => {
  const isUsingNamedImports = Array.isArray(imports)

  return {
    kind: StructureKind.ImportDeclaration,
    defaultImport: !isUsingNamedImports ? imports : undefined,
    namedImports: isUsingNamedImports ? imports : undefined,
    moduleSpecifier: module,
  }
}
