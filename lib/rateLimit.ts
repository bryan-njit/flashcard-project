// Simple rate limit: each IP address can make LIMIT requests per minute.
// It's kept in memory, so it resets when the server restarts. Good enough for a small app.
const LIMIT = 5;
const WINDOW_MS = 60 * 1000;

const requests = new Map<string, number[]>();

export function isRateLimited(ip: string) {
  const now = Date.now();
  const recent = (requests.get(ip) ?? []).filter((time) => now - time < WINDOW_MS);

  if (recent.length >= LIMIT) {
    requests.set(ip, recent);
    return true;
  }

  recent.push(now);
  requests.set(ip, recent);
  return false;
}
