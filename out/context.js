"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.collectContext = collectContext;
const vscode = __importStar(require("vscode"));
async function collectContext() {
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
    const dependencies = [];
    for (const uri of await vscode.workspace.findFiles("**/package.json", "**/node_modules/**", 50)) {
        try {
            const text = Buffer.from(await vscode.workspace.fs.readFile(uri)).toString("utf8");
            const manifest = JSON.parse(text);
            dependencies.push({
                manifest: vscode.workspace.asRelativePath(uri),
                dependencies: manifest.dependencies ?? {},
                devDependencies: manifest.devDependencies ?? {},
                peerDependencies: manifest.peerDependencies ?? {},
                optionalDependencies: manifest.optionalDependencies ?? {}
            });
        }
        catch {
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
