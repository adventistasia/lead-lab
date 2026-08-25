import { WebAuthnAbortService as y, startAuthentication as h, startRegistration as w, browserSupportsWebAuthnAutofill as g, browserSupportsWebAuthn as b } from "@simplewebauthn/browser";
class i extends Error {
  constructor(e) {
    super(e), this.name = "PasskeyError";
  }
}
class d extends i {
  constructor() {
    super("Passkeys are not supported in this browser."), this.name = "NotSupportedError";
  }
}
class E extends i {
  constructor() {
    super("The passkey operation was cancelled."), this.name = "UserCancelledError";
  }
}
class S extends i {
  constructor() {
    super("This device is already registered as a passkey."), this.name = "PasskeyExistsError";
  }
}
class k extends i {
  constructor(e) {
    const s = e ?? "this domain";
    super(
      `Passkeys can't be used on ${s}. For local development, use localhost.`
    ), this.name = "InvalidDomainError";
  }
}
const c = (t) => {
  if (t instanceof i)
    return t;
  if (!(t instanceof Error))
    return new i("An unknown error occurred.");
  if (v(t))
    return new k(R());
  switch (t.name) {
    case "NotAllowedError":
      return new E();
    case "InvalidStateError":
      return new S();
    case "NotSupportedError":
      return new d();
    default:
      return new i(t.message);
  }
}, v = (t) => A(t) === "ERROR_INVALID_DOMAIN", A = (t) => "code" in t && typeof t.code == "string" ? t.code : void 0, R = () => typeof globalThis.location?.hostname == "string" && globalThis.location.hostname.length > 0 ? globalThis.location.hostname : void 0;
let n = {};
const N = (t) => {
  n = {
    ...n,
    ...t,
    fetch: {
      ...n.fetch,
      ...t.fetch,
      headers: {
        ...n.fetch?.headers,
        ...t.fetch?.headers
      }
    }
  };
}, O = () => typeof document > "u" ? null : T() || C(), T = () => {
  const t = document.querySelector('meta[name="csrf-token"]');
  if (!t)
    return null;
  const e = t.getAttribute("content");
  return e ? { header: "X-CSRF-TOKEN", value: e } : null;
}, C = () => {
  const t = "XSRF-TOKEN=", e = document.cookie.split("; ").find((o) => o.startsWith(t));
  if (!e)
    return null;
  const s = e.slice(t.length);
  return s ? { header: "X-XSRF-TOKEN", value: decodeURIComponent(s) } : null;
}, u = async (t) => {
  const e = await fetch(t, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...n.fetch?.headers
    },
    credentials: n.fetch?.credentials ?? "same-origin"
  });
  return e.ok || await f(e), e.json();
}, l = async (t, e) => {
  const s = O(), o = {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...n.fetch?.headers
  };
  s && (o[s.header] = s.value);
  const r = await fetch(t, {
    method: "POST",
    headers: o,
    credentials: n.fetch?.credentials ?? "same-origin",
    body: JSON.stringify(e)
  });
  return r.ok || await f(r), r.json();
}, f = async (t) => {
  let e = `Request failed with status ${t.status}`;
  try {
    const s = await t.json();
    s && typeof s == "object" && "message" in s && typeof s.message == "string" && (e = s.message);
  } catch {
  }
  throw new Error(e);
}, a = {
  registerOptions: "/user/passkeys/options",
  registerStore: "/user/passkeys",
  verifyOptions: "/passkeys/login/options",
  verifySubmit: "/passkeys/login"
}, P = {
  /**
   * Configure the passkeys client.
   */
  configure(t) {
    N(t);
  },
  /**
   * Check if the browser supports passkeys.
   */
  isSupported() {
    return b();
  },
  /**
   * Check if the browser supports passkey autofill.
   */
  async isAutofillSupported() {
    return g();
  },
  /**
   * Register a new passkey for the authenticated user.
   */
  async register(t) {
    if (!this.isSupported())
      throw new d();
    this.cancel();
    try {
      const e = p(t, {
        options: a.registerOptions,
        submit: a.registerStore
      }), { options: s } = await u(e.optionsRoute), o = await w({ optionsJSON: s }), r = {
        name: t.name,
        credential: o
      };
      return await l(
        e.submitRoute,
        r
      );
    } catch (e) {
      throw c(e);
    }
  },
  /**
   * Verify with a passkey.
   */
  async verify(t = {}) {
    if (!this.isSupported())
      throw new d();
    this.cancel();
    try {
      const e = p(t, {
        options: a.verifyOptions,
        submit: a.verifySubmit
      }), { options: s } = await u(
        e.optionsRoute
      ), r = { credential: await h({ optionsJSON: s }) };
      return await l(e.submitRoute, r);
    } catch (e) {
      throw c(e);
    }
  },
  /**
   * Enable passkey autofill on the current page.
   *
   * Note that the page must have an input with `autocomplete="email webauthn"` to
   * anchor the browser's passkey picker dropdown.
   *
   * Returns the verification response on success, or `undefined` if autofill
   * is not supported or was cancelled.
   */
  async autofill(t = {}) {
    if (!(!this.isSupported() || !await this.isAutofillSupported()))
      try {
        const s = p(t, {
          options: a.verifyOptions,
          submit: a.verifySubmit
        }), { options: o } = await u(
          s.optionsRoute
        ), m = { credential: await h({
          optionsJSON: o,
          useBrowserAutofill: !0
        }) };
        return await l(s.submitRoute, m);
      } catch (s) {
        if (s instanceof Error && ["AbortError", "NotAllowedError"].includes(s.name))
          return;
        throw c(s);
      }
  },
  /**
   * Cancel any pending passkey operation.
   */
  cancel() {
    y.cancelCeremony();
  }
}, p = (t, e) => ({
  optionsRoute: t.routes?.options ?? e.options,
  submitRoute: t.routes?.submit ?? e.submit
});
export {
  k as I,
  d as N,
  i as P,
  E as U,
  S as a,
  P as b,
  a as d,
  c as t
};
