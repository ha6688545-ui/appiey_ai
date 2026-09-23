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
const context_1 = require("./context");
const client_1 = require("./client");
const sidebarProvider_1 = require("./sidebar/sidebarProvider");
function activate(context) {
    context.subscriptions.push(vscode.window.registerWebviewViewProvider("appiey.sidebar", new sidebarProvider_1.AppieySidebarProvider()));
    context.subscriptions.push(vscode.commands.registerCommand("appiey.openSidebar", () => vscode.commands.executeCommand("workbench.view.extension.appiey")));
    context.subscriptions.push(vscode.commands.registerCommand("appiey.sendContext", async () => {
        try {
            const apiUrl = vscode.workspace.getConfiguration("appiey").get("apiUrl");
            if (!apiUrl)
                throw new Error("Appiey API URL is not configured.");
            const result = await (0, client_1.sendToAppiey)(apiUrl, await (0, context_1.collectContext)());
            vscode.window.showInformationMessage(JSON.stringify(result));
        }
        catch (error) {
            vscode.window.showErrorMessage(error instanceof Error ? error.message : "Appiey connection failed.");
        }
    }));
}
function deactivate() { }
