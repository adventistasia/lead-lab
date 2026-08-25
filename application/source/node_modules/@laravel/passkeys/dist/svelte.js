import * as e from "svelte/internal/client";
import { onMount as d } from "svelte";
import { b as s, t as m } from "./passkeys-yRK3MD0m.js";
function k({ autofill: y = !1, routes: i, onSuccess: c, onError: l } = {}) {
  let t = e.state(!1), n = e.state(null), a = e.state(!1), g = e.state(null);
  const f = () => {
    e.set(n, null), e.set(g, null);
  }, p = (o) => {
    const r = m(o);
    e.set(n, r.message, !0), e.set(g, r, !0), l?.(r);
  }, u = async () => {
    e.set(t, !0), f();
    try {
      const o = await s.verify({ routes: i });
      c?.(o);
    } catch (o) {
      p(o);
    } finally {
      e.set(t, !1);
    }
  };
  return d(() => {
    if (e.set(a, s.isSupported(), !0), !!y)
      return s.cancel(), (async () => {
        if (await s.isAutofillSupported()) {
          e.set(t, !0), f();
          try {
            const r = await s.autofill({ routes: i });
            r && c?.(r);
          } catch (r) {
            p(r);
          } finally {
            e.set(t, !1);
          }
        }
      })(), () => {
        s.cancel();
      };
  }), {
    verify: u,
    get isLoading() {
      return e.get(t);
    },
    get error() {
      return e.get(n);
    },
    get errorInstance() {
      return e.get(g);
    },
    get isSupported() {
      return e.get(a);
    }
  };
}
function w({ routes: y, onSuccess: i, onError: c } = {}) {
  let l = e.state(!1), t = e.state(null), n = e.state(!1), a = e.state(null);
  return d(() => {
    e.set(n, s.isSupported(), !0);
  }), {
    register: async (f) => {
      e.set(l, !0), e.set(t, null), e.set(a, null);
      try {
        await s.register({ name: f, routes: y }), i?.();
      } catch (p) {
        const u = m(p);
        e.set(t, u.message, !0), e.set(a, u, !0), c?.(u);
      } finally {
        e.set(l, !1);
      }
    },
    get isLoading() {
      return e.get(l);
    },
    get error() {
      return e.get(t);
    },
    get errorInstance() {
      return e.get(a);
    },
    get isSupported() {
      return e.get(n);
    }
  };
}
export {
  w as usePasskeyRegister,
  k as usePasskeyVerify
};
