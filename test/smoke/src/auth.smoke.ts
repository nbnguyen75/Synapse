import http from "k6/http";
import { check, group, sleep } from "k6";
import type { Options } from "k6/options";
import { config, jsonHeaders } from "./common/config.ts";
import type { AuthTokenData } from "./common/types.ts";

const base = config.useKong ? config.kongUrl : config.authUrl;

export const options: Options = {
  vus: config.vus,
  iterations: config.iterations,
  thresholds: {
    http_req_duration: ["p(95)<800"],
    http_req_failed: ["rate<0.05"],
  },
};

export default function (): void {
  const email = `test_${Date.now()}_${__VU}@synapse.com`;

  group("Sign up", () => {
    const res = http.post(
      `${base}/sign-up/email`,
      JSON.stringify({
        email,
        password: config.testPassword,
        name: "Test User",
      }),
      { headers: jsonHeaders({ Origin: base }) },
    );
    check(res, {
      "sign-up status is 200/201": (r) => [200, 201].includes(r.status),
    });
  });

  group("Sign in", () => {
    const res = http.post(
      `${base}/sign-in/email`,
      JSON.stringify({ email, password: config.testPassword }),
      { headers: jsonHeaders({ Origin: base }) },
    );
    check(res, { "sign-in status is 200": (r) => r.status === 200 });
  });

  group("Get token", () => {
    const res = http.get(`${base}/token`, {
      headers: jsonHeaders({ Origin: base }),
    });
    const ok = check(res, {
      "get-token status is 200": (r) => r.status === 200,
    });
    if (ok) {
      const body = JSON.parse(res.body as string) as AuthTokenData;
      check(body, { "token is present": (b) => !!b.token });
    }
  });

  group("JWKS reachable", () => {
    const res = http.get(`${base}/.well-known/jwks.json`);
    check(res, { "jwks status is 200": (r) => r.status === 200 });
  });

  sleep(1);
}
