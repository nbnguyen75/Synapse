import http from "k6/http";
import { check, group, sleep } from "k6";
import type { Options } from "k6/options";
import { config, jsonHeaders } from "./common/config.ts";
import type {
  ApiResponse,
  AuthTokenData,
  Note,
  PaginatedData,
} from "./common/types.ts";

const authBase = `${config.kongUrl}/api/v1/auth`;
const notesBase = `${config.kongUrl}/api/v1/notes`;

export const options: Options = {
  vus: config.vus,
  iterations: config.iterations,
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.05"],
  },
};

interface SetupData {
  token: string;
}

export function setup(): SetupData {
  const email = `kong_test_${Date.now()}@synapse.com`;

  http.post(
    `${authBase}/sign-up/email`,
    JSON.stringify({
      email,
      password: config.testPassword,
      name: "Kong Tester",
    }),
    { headers: jsonHeaders({ Origin: authBase }) },
  );

  http.post(
    `${authBase}/sign-in/email`,
    JSON.stringify({ email, password: config.testPassword }),
    { headers: jsonHeaders({ Origin: authBase }) },
  );

  const tokenRes = http.get(`${authBase}/token`, {
    headers: jsonHeaders({ Origin: authBase }),
  });
  const body = JSON.parse(tokenRes.body as string) as AuthTokenData;

  if (!body.token) {
    throw new Error("setup() failed: no token returned via Kong");
  }
  return { token: body.token };
}

export default function (data: SetupData): void {
  const authHeader = { Authorization: `Bearer ${data.token}` };
  let noteId = "";

  group("Kong -> Auth: jwks reachable", () => {
    const res = http.get(`${authBase}/.well-known/jwks.json`);
    check(res, { "jwks status is 200": (r) => r.status === 200 });
  });

  group("Kong -> Notes: create", () => {
    const res = http.post(
      `${notesBase}`,
      JSON.stringify({
        title: "Note qua Kong",
        content: "Test route qua gateway",
      }),
      { headers: jsonHeaders(authHeader) },
    );
    const ok = check(res, {
      "create status is 200/201": (r) => [200, 201].includes(r.status),
    });
    if (ok) {
      const body = JSON.parse(res.body as string) as ApiResponse<Note>;
      check(body, {
        "envelope success is true": (b) => b.success === true,
        "envelope has note id": (b) => !!b.data?.id,
      });
      noteId = body.data?.id || "";
    }
  });

  group("Kong -> Notes: list (paginated)", () => {
    const res = http.get(`${notesBase}?page=0&size=10`, {
      headers: authHeader,
    });
    const ok = check(res, { "list status is 200": (r) => r.status === 200 });
    if (ok) {
      const body = JSON.parse(res.body as string) as ApiResponse<
        PaginatedData<Note>
      >;
      check(body, {
        "envelope success is true": (b) => b.success === true,
        "data.items is array": (b) => Array.isArray(b.data?.items),
        "data.totalElements >= items.length": (b) =>
          b.data?.totalElements >= (b.data?.items?.length ?? 0),
      });
    }
  });

  group("Kong -> Notes: delete (cleanup)", () => {
    if (!noteId) return;
    const res = http.del(`${notesBase}/${noteId}`, null, {
      headers: authHeader,
    });
    check(res, {
      "delete status is 200/204": (r) => [200, 204].includes(r.status),
    });
  });

  group("Kong admin: services loaded", () => {
    const res = http.get(`${config.kongAdminUrl}/services`);
    check(res, { "kong admin reachable": (r) => r.status === 200 });
  });

  sleep(1);
}
