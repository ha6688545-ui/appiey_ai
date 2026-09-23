import * as vscode from "vscode";
import { collectContext } from "./context";
import { sendToAppiey } from "./client";
import { AppieySidebarProvider } from "./sidebar/sidebarProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "appiey.sidebar",
      new AppieySidebarProvider()
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("appiey.openSidebar", () =>
      vscode.commands.executeCommand("workbench.view.extension.appiey")
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("appiey.sendContext", async () => {
      try {
        const apiUrl = vscode.workspace.getConfiguration("appiey").get<string>("apiUrl");
        if (!apiUrl) throw new Error("Appiey API URL is not configured.");
        const result = await sendToAppiey(apiUrl, await collectContext());
        vscode.window.showInformationMessage(JSON.stringify(result));
      } catch (error) {
        vscode.window.showErrorMessage(
          error instanceof Error ? error.message : "Appiey connection failed."
        );
      }
    })
  );
}

export function deactivate() {}
