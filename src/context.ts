import * as vscode from "vscode";

export async function collectContext(): Promise<{
  activeFile: { fileName: string | null; language: string | null; code: string | null };
  diagnostics: Array<Record<string, unknown>>;
  dependencies: Array<Record<string, unknown>>;
}> {
  const editor = vscode.window.activeTextEditor;
  const document = editor?.document;

  const diagnostics = document
    ? vscode.languages.getDiagnostics(document.uri).map((diagnostic) => ({
        fileName: document.fileName,
        message: diagnostic.message,
        severity: diagnostic.severity,
        source: diagnostic.source ?? null,
        code: diagnostic.code ?? null,
        range: {
          start: { line: diagnostic.range.start.line, character: diagnostic.range.start.character },
          end: { line: diagnostic.range.end.line, character: diagnostic.range.end.character }
        }
      }))
    : [];

  const dependencies: Array<Record<string, unknown>> = [];
  for (const uri of await vscode.workspace.findFiles("**/package.json", "**/node_modules/**", 50)) {
    try {
      const text = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString("utf8");
      const manifest = JSON.parse(text) as Record<string, unknown>;
      dependencies.push({
        manifest: vscode.workspace.asRelativePath(uri),
        dependencies: manifest.dependencies ?? {},
        devDependencies: manifest.devDependencies ?? {},
        peerDependencies: manifest.peerDependencies ?? {},
        optionalDependencies: manifest.optionalDependencies ?? {}
      });
    } catch {
      // Raw context collection skips unreadable or invalid manifests.
    }
  }

  return {
    activeFile: {
      fileName: document?.fileName ?? null,
      language: document?.languageId ?? null,
      code: document?.getText() ?? null
    },
    diagnostics,
    dependencies
  };
}
