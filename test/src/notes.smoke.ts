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

// Gọi thẳng service, không qua Kong
const authBase = config.authUrl;
const notesBase = config.notesUrl;

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
  const email = `notes_test_${Date.now()}@synapse.com`;

  http.post(
    `${authBase}/sign-up/email`,
    JSON.stringify({
      email,
      password: config.testPassword,
      name: "Notes Tester",
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
    throw new Error("setup() failed: no token returned from auth service");
  }
  return { token: body.token };
}

export default function (data: SetupData): void {
  const authHeader = { Authorization: `Bearer ${data.token}` };
  let noteId = "";

  group("Create note", () => {
    const res = http.post(
      `${notesBase}`,
      JSON.stringify({ title: "Meeting Note", content: "Discuss UI UX" }),
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

  group("List notes (paginated)", () => {
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
        "data.page is number": (b) => typeof b.data?.page === "number",
        "data.size is number": (b) => typeof b.data?.size === "number",
        "data.totalElements >= items.length": (b) =>
          b.data?.totalElements >= (b.data?.items?.length ?? 0),
        "data.totalPages is number": (b) =>
          typeof b.data?.totalPages === "number",
        "data.isLast is boolean": (b) => typeof b.data?.isLast === "boolean",
        "each item has required note fields": (b) =>
          b.data.items.every(
            (n) => !!n.id && !!n.title && !!n.createdAt && !!n.updatedAt,
          ),
      });
    }
  });

  group("Get note by id", () => {
    if (!noteId) return;
    const res = http.get(`${notesBase}/${noteId}`, { headers: authHeader });
    const ok = check(res, { "get status is 200": (r) => r.status === 200 });
    if (ok) {
      const body = JSON.parse(res.body as string) as ApiResponse<Note>;
      check(body, { "envelope success is true": (b) => b.success === true });
    }
  });

  group("Update note", () => {
    if (!noteId) return;
    const res = http.put(
      `${notesBase}/${noteId}`,
      JSON.stringify({ title: "Note đã sửa", content: "Nội dung mới" }),
      { headers: jsonHeaders(authHeader) },
    );
    check(res, { "update status is 200": (r) => r.status === 200 });
  });

  group("Delete note", () => {
    if (!noteId) return;
    const res = http.del(`${notesBase}/${noteId}`, null, {
      headers: authHeader,
    });
    check(res, {
      "delete status is 200/204": (r) => [200, 204].includes(r.status),
    });
  });

  sleep(1);
}
