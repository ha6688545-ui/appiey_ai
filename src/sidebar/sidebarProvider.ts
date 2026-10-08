import * as vscode from "vscode"

type Handler = (message: any, view: vscode.WebviewView) => void | Promise<void>

export class AppieySidebarProvider implements vscode.WebviewViewProvider {
  constructor(
    private readonly _ctx: vscode.ExtensionContext,
    private readonly handler: Handler
  ) {}

  async resolveWebviewView(webviewView: vscode.WebviewView): Promise<void> {
    webviewView.webview.options = { enableScripts: true }
    webviewView.webview.onDidReceiveMessage(
      msg => this.handler(msg, webviewView),
      undefined,
      this._ctx.subscriptions
    )
    const file = vscode.Uri.joinPath(
      this._ctx.extensionUri, "ide-sidebar", "src", "index.html"
    )
    const html = new TextDecoder().decode(await vscode.workspace.fs.readFile(file))
    webviewView.webview.html = html.replace(
      "</head>",
      `<script>const vscode = acquireVsCodeApi();</script></head>`
    )
  }
}
