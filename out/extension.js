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
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const sidebarProvider_1 = require("./sidebar/sidebarProvider");
const context_1 = require("./context");
const client_1 = require("./client");
const API_URL = process.env.CENTURION_API_URL || "http://127.0.0.1:8787";
async function executeIdeCommands(commands) {
    const out = [];
    for (const cmd of commands || []) {
        const kind = (cmd.kind || "").toLowerCase();
        const base = { id: cmd.id, kind: cmd.kind || kind, ok: true };
        try {
            if (kind === "writefile") {
                if (!cmd.path) {
                    base.ok = false;
                    base.message = "missing path";
                    out.push(base);
                    continue;
                }
                const content = Buffer.from(cmd.content ?? "", "utf8");
                const uri = vscode.Uri.file(cmd.path);
                try {
                    await vscode.workspace.fs.stat(uri);
                }
                catch {
                    await vscode.workspace.fs.createDirectory(vscode.Uri.joinPath(uri, ".."));
                }
                await vscode.workspace.fs.writeFile(uri, new Uint8Array(content));
                base.message = `Wrote ${cmd.path}`;
                out.push(base);
                continue;
            }
            if (kind === "deletefile") {
                if (!cmd.path) {
                    base.ok = false;
                    base.message = "missing path";
                    out.push(base);
                    continue;
                }
                await vscode.workspace.fs.delete(vscode.Uri.file(cmd.path), { recursive: true, useTrash: true });
                base.message = `Deleted ${cmd.path}`;
                out.push(base);
                continue;
            }
            if (kind === "mkdir") {
                if (!cmd.path) {
                    base.ok = false;
                    base.message = "missing path";
                    out.push(base);
                    continue;
                }
                await vscode.workspace.fs.createDirectory(vscode.Uri.file(cmd.path));
                base.message = `Created dir ${cmd.path}`;
                out.push(base);
                continue;
            }
            if (kind === "readfile") {
                if (!cmd.path) {
                    base.ok = false;
                    base.message = "missing path";
                    out.push(base);
                    continue;
                }
                const bytes = await vscode.workspace.fs.readFile(vscode.Uri.file(cmd.path));
                base.stdout = Buffer.from(bytes).toString("utf8");
                out.push(base);
                continue;
            }
            if (kind === "terminal" || kind === "shell" || kind === "run") {
                const command = cmd.command;
                if (!command) {
                    base.ok = false;
                    base.message = "missing command";
                    out.push(base);
                    continue;
                }
                const cwd = cmd.cwd || vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
                const term = vscode.window.createTerminal({ name: "Centurion", cwd });
                term.show(true);
                term.sendText(command);
                base.message = `Dispatched: ${command}`;
                out.push(base);
                continue;
            }
            if (kind === "executecommand" || kind === "vscodecommand") {
                if (!cmd.command) {
                    base.ok = false;
                    base.message = "missing command";
                    out.push(base);
                    continue;
                }
                const args = Array.isArray(cmd.args) ? cmd.args : [];
                await vscode.commands.executeCommand(cmd.command, ...args);
                base.message = `Ran vscode command ${cmd.command}`;
                out.push(base);
                continue;
            }
            if (kind === "applyedit") {
                const edits = Array.isArray(cmd.edits)
                    ? cmd.edits
                    : [];
                if (!edits.length) {
                    base.ok = false;
                    base.message = "no edits";
                    out.push(base);
                    continue;
                }
                const we = new vscode.WorkspaceEdit();
                for (const e of edits) {
                    if (!e.path || !Array.isArray(e.edits))
                        continue;
                    const uri = vscode.Uri.file(e.path);
                    const arr = [];
                    for (const te of e.edits) {
                        if (te.type === "insert")
                            arr.push(vscode.TextEdit.insert(new vscode.Position(te.line ?? 0, te.character ?? 0), String(te.text ?? "")));
                        else if (te.type === "replace")
                            arr.push(vscode.TextEdit.replace(new vscode.Range(new vscode.Position(te.range?.[0]?.line ?? 0, te.range?.[0]?.character ?? 0), new vscode.Position(te.range?.[1]?.line ?? 0, te.range?.[1]?.character ?? 0)), String(te.text ?? "")));
                        else if (te.type === "delete")
                            arr.push(vscode.TextEdit.delete(new vscode.Range(new vscode.Position(te.range?.[0]?.line ?? 0, te.range?.[0]?.character ?? 0), new vscode.Position(te.range?.[1]?.line ?? 0, te.range?.[1]?.character ?? 0))));
                    }
                    we.set(uri, arr);
                }
                const ok = await vscode.workspace.applyEdit(we);
                base.ok = ok;
                base.message = ok ? "Edits applied" : "Edits rejected";
                out.push(base);
                continue;
            }
            base.ok = false;
            base.message = `Unsupported command kind: ${cmd.kind}`;
            out.push(base);
        }
        catch (err) {
            base.ok = false;
            base.message = err instanceof Error ? err.message : String(err);
            out.push(base);
        }
    }
    return out;
}
function activate(context) {
    const provider = new sidebarProvider_1.AppieySidebarProvider(context, async (message, view) => {
        const post = (event) => view.webview.postMessage({ target: "centurion-sidebar", event });
        const patchActions = (ids, patch) => {
            if (!ids)
                return;
            for (const id of ids)
                post({ type: "action_status", id, patch });
        };
        try {
            if (message.type === "prompt") {
                post({ type: "thinking", on: true });
                const ideContext = await (0, context_1.collectContext)();
                const workspacePath = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? "";
                const result = await (0, client_1.sendIdeRequest)(API_URL, {
                    user_query: message.payload?.text ?? String(message.payload),
                    session_id: String(message.payload?.session ?? "default"),
                    codebase_path: workspacePath,
                    context: ideContext,
                });
                post({ type: "thinking", on: false });
                post({ type: "backend_result", payload: result });
            }
            else if (message.type === "approve") {
                const actionId = message.payload?.id;
                if (actionId)
                    post({ type: "action_status", id: actionId, patch: { status: "running" } });
                const result = await (0, client_1.sendDecision)(API_URL, {
                    decision: "approve",
                    id: actionId,
                });
                post({ type: "decision_result", payload: result });
                const commands = Array.isArray(result?.ide_commands) ? result.ide_commands : [];
                const action_ids = [...new Set(commands.map(c => c.id).filter((x) => !!x))];
                let final = null;
                let execError;
                let execResults = [];
                if (commands.length) {
                    try {
                        execResults = await executeIdeCommands(commands);
                        if (actionId || result?.action_id) {
                            final = await (0, client_1.sendActionResult)(API_URL, {
                                action_id: result?.action_id || actionId,
                                results: execResults,
                            });
                        }
                    }
                    catch (err) {
                        execError = err instanceof Error ? err.message : String(err);
                        if (actionId || result?.action_id) {
                            try {
                                final = await (0, client_1.sendActionResult)(API_URL, {
                                    action_id: result?.action_id || actionId,
                                    results: execResults,
                                    error: execError,
                                });
                            }
                            catch { /* ignore */ }
                        }
                    }
                    patchActions(action_ids, { status: (execError || execResults.some(r => !r.ok)) ? "failed" : "done", result: execResults.map(r => `${r.ok ? "OK" : "ERR"} ${r.kind}${r.message ? ": " + r.message : ""}`).join("\n") });
                }
                if (final) {
                    post({ type: "backend_result", payload: final });
                }
                else if (execError) {
                    post({ type: "error", message: execError });
                }
            }
            else if (message.type === "reject") {
                const actionId = message.payload?.id;
                if (actionId)
                    post({ type: "action_status", id: actionId, patch: { status: "rejected" } });
                const result = await (0, client_1.sendDecision)(API_URL, {
                    decision: "reject",
                    id: actionId,
                });
                post({ type: "decision_result", payload: result });
            }
        }
        catch (error) {
            post({ type: "error", message: error instanceof Error ? error.message : "Centurion request failed" });
        }
    });
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("appiey.sidebar", provider));
    context.subscriptions.push(vscode.commands.registerCommand("appiey.openSidebar", () => vscode.commands.executeCommand("workbench.view.extension.appiey")));
}
function deactivate() { }
