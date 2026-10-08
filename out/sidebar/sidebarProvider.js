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
exports.AppieySidebarProvider = void 0;
const vscode = __importStar(require("vscode"));
class AppieySidebarProvider {
    _ctx;
    handler;
    constructor(_ctx, handler) {
        this._ctx = _ctx;
        this.handler = handler;
    }
    async resolveWebviewView(webviewView) {
        webviewView.webview.options = { enableScripts: true };
        webviewView.webview.onDidReceiveMessage(msg => this.handler(msg, webviewView), undefined, this._ctx.subscriptions);
        const file = vscode.Uri.joinPath(this._ctx.extensionUri, "ide-sidebar", "src", "index.html");
        const html = new TextDecoder().decode(await vscode.workspace.fs.readFile(file));
        webviewView.webview.html = html.replace("</head>", `<script>const vscode = acquireVsCodeApi();</script></head>`);
    }
}
exports.AppieySidebarProvider = AppieySidebarProvider;
