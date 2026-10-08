# Centurion IDE Sidebar

The sidebar UI for the Centurion extension. One file, no build step, no dependencies.

## Structure

```
ide-sidebar/
├── src/
│   └── index.html
├── package.json
└── README.md
```

## Run locally

Open `src/index.html` in a browser, or run:

```
npm start
```

## What it does

- Chat with history, attachments, and thinking states
- Actions tab with Approve / Reject and live status
- Pipeline strip: Prompt → LLM → Engine → Action → Approval → Verify → Result

The UI currently runs on mock data (`mockEngine` and `mockExecute` in `index.html`).

## Backend hookup (later)

Send events into the UI:

```js
window.Centurion.receive({ type: "message", message: { role: "assistant", content: "..." } })
```

Event types: `stage`, `message`, `action`, `action_status`, `thinking`.

From a parent window, use `postMessage`:

```js
{ target: "centurion-sidebar", event: { type: "stage", index: 2 } }
```

The UI sends these back to the parent: `prompt`, `approve`, `reject`.

## Notes

- Michroma loads from Google Fonts. In the VS Code webview, allow `fonts.googleapis.com` and `fonts.gstatic.com` in the content security policy, or bundle the font.