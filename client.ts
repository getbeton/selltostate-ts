// Generated from OpenAPI. Do not edit methods by hand.
export const DEFAULT_BASE_URL = "https://app.selltostate.com";

export class AuthError extends Error {
  readonly status = 401;
  readonly body: unknown;
  constructor(body: unknown) {
    super("unauthorized");
    this.name = "AuthError";
    this.body = body;
  }
}

export class PaymentError extends Error {
  readonly status = 402;
  readonly body: unknown;
  readonly payment_link: string | undefined;
  readonly plan: string | undefined;
  readonly machine_payment: unknown;
  constructor(body: unknown) {
    super("payment_required");
    this.name = "PaymentError";
    this.body = body;
    const row = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
    this.payment_link = typeof row.payment_link === "string" ? row.payment_link : undefined;
    this.plan = typeof row.plan === "string" ? row.plan : undefined;
    this.machine_payment = row.machine_payment;
  }
}

export class RateLimitError extends Error {
  readonly status = 429;
  readonly body: unknown;
  constructor(body: unknown) {
    super("rate_limited");
    this.name = "RateLimitError";
    this.body = body;
  }
}

export type ClientOptions = {
  apiKey?: string;
  clientId?: string;
  baseUrl?: string;
  fetchImpl?: typeof fetch;
};

export class SellToState {
  readonly baseUrl: string;
  readonly apiKey: string | undefined;
  readonly clientId: string | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(opts: ClientOptions = {}) {
    const env = globalThis.process?.env ?? {};
    this.apiKey = opts.apiKey ?? env.STS_API_KEY;
    this.clientId = opts.clientId;
    this.baseUrl = (opts.baseUrl ?? env.STS_API_URL ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
    this.fetchImpl = opts.fetchImpl ?? globalThis.fetch;
  }

  async request(
    method: string,
    path: string,
    args: Record<string, unknown>,
    pathParams: string[],
  ): Promise<unknown> {
    let urlPath = path;
    for (const name of pathParams) {
      const value = args[name];
      if (value === undefined || value === null || value === "") {
        throw new Error("missing path param: " + name);
      }
      urlPath = urlPath.replace("{" + name + "}", encodeURIComponent(String(value)));
    }
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(args)) {
      if (pathParams.includes(key) || key === "body") continue;
      if (value === undefined || value === null || value === "") continue;
      qs.append(key, String(value));
    }
    const query = qs.toString();
    const url = this.baseUrl + urlPath + (query ? "?" + query : "");
    const headers: Record<string, string> = { accept: "application/json" };
    if (this.apiKey) headers["x-api-key"] = this.apiKey;
    else if (this.clientId) headers.authorization = "Bearer client:" + this.clientId;
    let body: string | undefined;
    if (args.body !== undefined && method !== "GET") {
      headers["content-type"] = "application/json";
      body = JSON.stringify(args.body);
    }
    const res = await this.fetchImpl(url, { method, headers, body });
    const text = await res.text();
    let parsed: unknown = text;
    if (text) {
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = text;
      }
    } else {
      parsed = null;
    }
    if (res.status === 401) throw new AuthError(parsed);
    if (res.status === 402) throw new PaymentError(parsed);
    if (res.status === 429) throw new RateLimitError(parsed);
    if (!res.ok) throw new Error("HTTP " + res.status);
    return parsed;
  }

  searchAwards(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/awards", args, []);
  }

  exportAwardsCsv(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/awards.csv", args, []);
  }

  getPrice(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/price", args, []);
  }

  payAutonomously(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/v1/pay", args, []);
  }

  registerClient(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/oidc/register", args, []);
  }

  mcp(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/mcp", args, []);
  }

  protectedResourceMetadata(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/.well-known/oauth-protected-resource", args, []);
  }

  authorizationServerMetadata(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/.well-known/oauth-authorization-server", args, []);
  }

  whoami(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/whoami", args, []);
  }

  search(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/search", args, []);
  }

  listBuyers(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/buyers", args, []);
  }

  getBuyer(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/buyers/{slug}", args, ["slug"]);
  }

  listSuppliers(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/suppliers", args, []);
  }

  getSupplier(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/suppliers/{slug}", args, ["slug"]);
  }

  listSectors(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/sectors", args, []);
  }

  getSector(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/sectors/{slug}", args, ["slug"]);
  }

  getTender(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/tenders/{id}", args, ["id"]);
  }

  getLists(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/lists", args, []);
  }

  createList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/v1/lists", args, []);
  }

  getList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/lists/{id}", args, ["id"]);
  }

  renameList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("PATCH", "/api/v1/lists/{id}", args, ["id"]);
  }

  deleteList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("DELETE", "/api/v1/lists/{id}", args, ["id"]);
  }

  addToList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/v1/lists/{id}/items", args, ["id"]);
  }

  removeFromList(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("DELETE", "/api/v1/lists/{id}/items", args, ["id"]);
  }

  getSavedSearches(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/saved-searches", args, []);
  }

  saveSearch(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("POST", "/api/v1/saved-searches", args, []);
  }

  getSavedSearch(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("GET", "/api/v1/saved-searches/{id}", args, ["id"]);
  }

  renameSavedSearch(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("PATCH", "/api/v1/saved-searches/{id}", args, ["id"]);
  }

  deleteSavedSearch(args: Record<string, unknown> = {}): Promise<unknown> {
    return this.request("DELETE", "/api/v1/saved-searches/{id}", args, ["id"]);
  }
}
