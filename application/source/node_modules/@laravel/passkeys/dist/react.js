import { useState as n, useSyncExternalStore as b, useRef as o, useEffect as v, useCallback as w } from "react";
import { b as e, t as L } from "./passkeys-yRK3MD0m.js";
const T = () => {
}, P = () => T, A = () => e.isSupported(), x = () => !1, q = ({
  autofill: c = !1,
  routes: u,
  onSuccess: a,
  onError: f
} = {}) => {
  const [p, t] = n(!1), [y, d] = n(null), [S, g] = n(
    null
  ), E = b(
    P,
    A,
    x
  ), s = o(a), l = o(f), m = o(u);
  v(() => {
    s.current = a, l.current = f, m.current = u;
  });
  const R = () => {
    d(null), g(null);
  }, h = (r) => {
    const I = L(r);
    d(I.message), g(I), l.current?.(I);
  }, i = w(async () => {
    t(!0), R();
    try {
      const r = await e.verify({
        routes: m.current
      });
      s.current?.(r);
    } catch (r) {
      h(r);
    } finally {
      t(!1);
    }
  }, []);
  return v(() => {
    if (!c)
      return;
    let r = !1;
    return e.cancel(), (async () => {
      const C = await e.isAutofillSupported();
      if (!(r || !C)) {
        t(!0), R();
        try {
          const k = await e.autofill({
            routes: m.current
          });
          if (r || !k)
            return;
          s.current?.(k);
        } catch (k) {
          if (r)
            return;
          h(k);
        } finally {
          t(!1);
        }
      }
    })(), () => {
      r = !0, e.cancel();
    };
  }, [c]), {
    verify: i,
    isLoading: p,
    error: y,
    errorInstance: S,
    isSupported: E
  };
}, z = ({
  routes: c,
  onSuccess: u,
  onError: a
} = {}) => {
  const [f, p] = n(!1), [t, y] = n(null), [d, S] = n(
    null
  ), g = b(
    P,
    A,
    x
  ), E = o(u), s = o(a), l = o(c);
  return v(() => {
    E.current = u, s.current = a, l.current = c;
  }), {
    register: w(async (R) => {
      p(!0), y(null), S(null);
      try {
        await e.register({
          name: R,
          routes: l.current
        }), E.current?.();
      } catch (h) {
        const i = L(h);
        y(i.message), S(i), s.current?.(i);
      } finally {
        p(!1);
      }
    }, []),
    isLoading: f,
    error: t,
    errorInstance: d,
    isSupported: g
  };
};
export {
  z as usePasskeyRegister,
  q as usePasskeyVerify
};
