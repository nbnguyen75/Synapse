export const config = {
  kongUrl: __ENV.KONG_URL || "http://localhost:8000",
  authUrl: __ENV.AUTH_URL || "http://localhost:5001",
  notesUrl: __ENV.NOTES_URL || "http://localhost:8082",
  kongAdminUrl: __ENV.KONG_ADMIN_URL || "http://localhost:8001",
  useKong: (__ENV.USE_KONG || "false") === "true",
  testPassword: __ENV.TEST_PASSWORD || "12345678",
  vus: Number(__ENV.VUS) || 1,
  iterations: Number(__ENV.ITERATIONS) || 1,
};

export function jsonHeaders(extra: Record<string, string> = {}) {
  return { "Content-Type": "application/json", ...extra };
}
