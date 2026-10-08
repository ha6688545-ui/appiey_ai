export async function sendToAppiey(
  apiUrl: string,
  context: unknown
): Promise<unknown> {
  return sendIdeRequest(apiUrl, { context });
}

export async function sendIdeRequest(
  apiUrl: string,
  request: unknown
): Promise<unknown> {
  return postJson(apiUrl, "/v1/ide/request", request);
}

export async function sendDecision(
  apiUrl: string,
  request: unknown
): Promise<unknown> {
  return postJson(apiUrl, "/v1/ide/decision", request);
}

export async function sendActionResult(
  apiUrl: string,
  request: unknown
): Promise<unknown> {
  return postJson(apiUrl, "/v1/ide/action_result", request);
}

async function postJson(
  apiUrl: string,
  path: string,
  request: unknown
): Promise<unknown> {
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
