import * as vscode from "vscode";
import { collectContext } from "../context";
import { sendDecision, sendIdeRequest } from "../client";

export class AppieySidebarProvider implements vscode.WebviewViewProvider {
  public resolveWebviewView(view: vscode.WebviewView): void {
    view.webview.options = { enableScripts: true };
    view.webview.html = render();

    view.webview.onDidReceiveMessage(async (message) => {
      const apiUrl = vscode.workspace.getConfiguration("appiey").get<string>("apiUrl");

      if (message.type === "context") {
        view.webview.postMessage({ type: "context", value: await collectContext() });
        return;
      }

      if (!apiUrl) {
        view.webview.postMessage({ type: "error", text: "Appiey API URL is not configured." });
        return;
      }

      try {
        if (message.type === "message") {
          view.webview.postMessage({ type: "loading" });
          const result = await sendIdeRequest(apiUrl, {
            instruction: message.text || "",
            context: await collectContext()
          });
          view.webview.postMessage({ type: "result", value: result });
        }

        if (message.type === "decision") {
          const result = await sendDecision(apiUrl, {
            decision: message.decision,
            action_id: message.actionId ?? null,
            result: message.result ?? null
          });
          view.webview.postMessage({ type: "result", value: result });
        }
      } catch (error) {
        view.webview.postMessage({
          type: "error",
          text: error instanceof Error ? error.message : "Appiey connection failed."
        });
      }
    });
  }
}

function render(): string {
  const nonce = String(Date.now());
  return `<!doctype html><html><head><meta charset="UTF-8"><meta http-equiv="Content-Security-Policy" content="default-src 'none';style-src 'unsafe-inline';script-src 'nonce-${nonce}'"><style>
+:root{color-scheme:dark;--bg:#101114;--panel:#17191e;--line:#2a2d35;--muted:#8d95a5;--text:#eef1f6;--accent:#8b7cff;--error:#ff8e9a}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:13px -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;height:100vh;display:flex;flex-direction:column}button{font:inherit;color:inherit;cursor:pointer}header{padding:15px 16px;border-bottom:1px solid var(--line);display:flex;align-items:center;gap:10px}.logo{width:27px;height:27px;border-radius:9px;background:linear-gradient(135deg,#a996ff,#5d4ee6);display:grid;place-items:center;font-weight:800}h1{font-size:14px;margin:0}.status{margin-left:auto;color:var(--muted);font-size:11px}.status.error{color:var(--error)}main{flex:1;overflow:auto;padding:15px 13px}.welcome{color:var(--muted);line-height:1.55;margin:2px 4px 18px}.welcome strong{color:var(--text);display:block;font-size:17px;margin-bottom:5px}.context{display:inline-block;border:1px solid var(--line);border-radius:6px;padding:5px 7px;font-size:11px;margin-top:8px}.message{display:flex;gap:8px;margin:14px 0}.avatar{flex:0 0 24px;height:24px;border-radius:8px;background:#282c36;display:grid;place-items:center;font-size:11px}.bubble{line-height:1.5;max-width:calc(100% - 32px);white-space:pre-wrap;overflow-wrap:anywhere}.user{justify-content:flex-end}.user .bubble{background:#282448;border:1px solid #433a78;padding:8px 10px;border-radius:11px 11px 3px 11px}.result{background:var(--panel);border:1px solid var(--line);border-radius:9px;padding:10px;margin:10px 0}.result pre{white-space:pre-wrap;overflow-wrap:anywhere;margin:0;color:#cbd3e1;font:11px ui-monospace,monospace}.decision{display:flex;gap:6px;margin-top:8px}.decision button{border:1px solid var(--line);background:#20232a;border-radius:6px;padding:6px 9px;font-size:11px}.decision .approve{background:var(--accent);border-color:var(--accent)}footer{padding:10px 12px 12px;border-top:1px solid var(--line)}textarea{width:100%;resize:none;background:#191b20;color:var(--text);border:1px solid var(--line);border-radius:9px;padding:10px 11px;min-height:46px;outline:none}.footer-row{display:flex;justify-content:space-between;align-items:center;margin-top:7px;color:var(--muted);font-size:10px}.send{background:var(--accent);border:0;border-radius:6px;padding:6px 11px}
+</style></head><body><header><div class="logo">A</div><h1>Appiey</h1><span id="status" class="status">Ready</span></header><main id="feed"><div class="welcome"><strong>Appiey</strong>Send an instruction with the current IDE context to the Algorithm.<div class="context">Raw context available</div></div></main><footer><textarea id="input" placeholder="Send an instruction to Appiey..."></textarea><div class="footer-row"><span>Enter to send | Shift+Enter for newline</span><button class="send" id="send">Send</button></div></footer><script nonce="${nonce}">const v=acquireVsCodeApi(),f=document.getElementById("feed"),i=document.getElementById("input"),s=document.getElementById("status");let last=null;function add(t,k){const r=document.createElement("div");r.className="message "+k;r.innerHTML='<div class="avatar">'+(k==="user"?"Y":"A")+'</div><div class="bubble"></div>';r.querySelector(".bubble").textContent=t;f.appendChild(r);f.scrollTop=f.scrollHeight}function result(x){last=x;const r=document.createElement("div");r.className="result";r.innerHTML='<pre></pre><div class="decision"><button class="approve">Approve</button><button class="reject">Reject</button></div>';r.querySelector("pre").textContent=JSON.stringify(x,null,2);r.querySelector(".approve").onclick=()=>v.postMessage({type:"decision",decision:"approve",actionId:x.action_id,result:last});r.querySelector(".reject").onclick=()=>v.postMessage({type:"decision",decision:"reject",actionId:x.action_id,result:last});f.appendChild(r);f.scrollTop=f.scrollHeight}function send(){const t=i.value.trim();if(t){add(t,"user");i.value="";s.textContent="Sending...";v.postMessage({type:"message",text:t})}}document.getElementById("send").onclick=send;i.onkeydown=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send()}};window.onmessage=e=>{const m=e.data;if(m.type==="loading")s.textContent="Waiting...";if(m.type==="context")s.textContent="Context ready";if(m.type==="result"){s.textContent="Ready";result(m.value)}if(m.type==="error"){s.textContent="Connection error";s.className="status error";add(m.text,"assistant")}};v.postMessage({type:"context"});</script></body></html>`;
}
