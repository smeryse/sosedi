import { Project, SyntaxKind, Node } from "ts-morph";
import path from "path";

const project = new Project();
const filePath = path.resolve(process.cwd(), "lib/repositories/supabase-repository.ts");
const sourceFile = project.addSourceFileAtPath(filePath);

// Add imports if they don't exist
const hasAppError = sourceFile.getImportDeclarations().some(imp => imp.getModuleSpecifierValue() === "@/lib/domain/errors");
if (!hasAppError) {
  sourceFile.addImportDeclaration({
    moduleSpecifier: "@/lib/domain/errors",
    namedImports: ["AppError", "handleSupabaseError"]
  });
}

// 1. Replace all explicit `any` types with `Record<string, unknown>`
const anyTypes = sourceFile.getDescendantsOfKind(SyntaxKind.AnyKeyword);
anyTypes.forEach(anyType => {
  anyType.replaceWithText("Record<string, unknown>");
});

// 2. Wrap existing errors inside Supabase repository with handleSupabaseError
const throwStatements = sourceFile.getDescendantsOfKind(SyntaxKind.ThrowStatement);
throwStatements.forEach(throwStmt => {
  const expr = throwStmt.getExpression();
  if (expr && expr.getKind() === SyntaxKind.NewExpression) {
    const args = expr.asKind(SyntaxKind.NewExpression)?.getArguments();
    if (args && args.length > 0) {
      const msgText = args[0].getText();
      // Check if there is an `error` variable in the current scope
      const scope = throwStmt.getFirstAncestorByKind(SyntaxKind.Block) || throwStmt.getParent();
      const hasErrorVar = scope?.getDescendantsOfKind(SyntaxKind.Identifier).some(id => id.getText() === "error");
      
      if (hasErrorVar) {
        throwStmt.replaceWithText(`return handleSupabaseError(error, ${msgText});`);
      } else {
        throwStmt.replaceWithText(`throw new AppError(${msgText}, "INTERNAL_ERROR");`);
      }
    }
  }
});

sourceFile.saveSync();
console.log("Refactoring complete");
