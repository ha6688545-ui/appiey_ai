"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToAppiey = sendToAppiey;
exports.sendIdeRequest = sendIdeRequest;
exports.sendDecision = sendDecision;
async function sendToAppiey(apiUrl, context) {
    return sendIdeRequest(apiUrl, { context });
}
async function sendIdeRequest(apiUrl, request) {
    return postJson(apiUrl, "/v1/ide/debug", request);
}
async function sendDecision(apiUrl, request) {
    return postJson(apiUrl, "/v1/ide/decision", request);
}
async function postJson(apiUrl, path, request) {
    const response = await fetch(`${apiUrl}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request)
    });
    if (!response.ok) {
        throw new Error(`Appiey API error: ${response.status}`);
    }
    return response.json();
}
