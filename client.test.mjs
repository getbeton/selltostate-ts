import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { SellToState, AuthError, PaymentError, RateLimitError } from "./client.ts";

const ids = JSON.parse(readFileSync(new URL("./operations.json", import.meta.url), "utf8"));

test("covers every operationId", () => {
  const src = readFileSync(new URL("./client.ts", import.meta.url), "utf8");
  for (const id of ids) assert.match(src, new RegExp("\\b" + id + "\\b"));
  const sts = new SellToState({ apiKey: "sts_test", fetchImpl: async () => ({ ok: true, status: 200, text: async () => "null" }) });
  for (const id of ids) assert.equal(typeof sts[id], "function");
});

test("whoami uses x-api-key and the live host", async () => {
  let calls = 0;
  let seen;
  const sts = new SellToState({
    apiKey: "sts_test",
    clientId: "should-not-send",
    fetchImpl: async (url, init) => {
      calls += 1;
      seen = { url, headers: init.headers };
      return { ok: true, status: 200, text: async () => "{}" };
    },
  });
  await sts.whoami();
  assert.equal(calls, 1);
  assert.equal(seen.url, "https://app.selltostate.com/api/v1/whoami");
  assert.equal(seen.headers["x-api-key"], "sts_test");
  assert.equal(seen.headers.authorization, undefined);
});

test("401 does not retry", async () => {
  let calls = 0;
  const sts = new SellToState({
    apiKey: "sts_test",
    fetchImpl: async () => {
      calls += 1;
      return { ok: false, status: 401, text: async () => JSON.stringify({ error: "unauthorized" }) };
    },
  });
  await assert.rejects(() => sts.whoami(), AuthError);
  assert.equal(calls, 1);
});

test("402 exposes payment fields and does not retry", async () => {
  let calls = 0;
  const body = { error: "payment_required", payment_link: "https://pay.example", plan: "data-monthly", machine_payment: { endpoint: "https://app.selltostate.com/api/v1/pay" } };
  const sts = new SellToState({
    apiKey: "sts_test",
    fetchImpl: async () => {
      calls += 1;
      return { ok: false, status: 402, text: async () => JSON.stringify(body) };
    },
  });
  await assert.rejects(() => sts.searchAwards(), (err) => {
    assert.ok(err instanceof PaymentError);
    assert.equal(err.payment_link, body.payment_link);
    assert.equal(err.plan, body.plan);
    assert.deepEqual(err.machine_payment, body.machine_payment);
    return true;
  });
  assert.equal(calls, 1);
});

test("429 does not retry", async () => {
  let calls = 0;
  const sts = new SellToState({
    apiKey: "sts_test",
    fetchImpl: async () => {
      calls += 1;
      return { ok: false, status: 429, text: async () => "{}" };
    },
  });
  await assert.rejects(() => sts.whoami(), RateLimitError);
  assert.equal(calls, 1);
});

test("default host is not the undeployed api host", () => {
  const src = readFileSync(new URL("./client.ts", import.meta.url), "utf8");
  assert.equal(src.includes("https://api.selltostate.com"), false);
});
