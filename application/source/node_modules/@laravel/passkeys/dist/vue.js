import { ref as t, onMounted as d, onUnmounted as m } from "vue";
import { b as s, t as g } from "./passkeys-yRK3MD0m.js";
const w = ({
  autofill: y = !1,
  routes: c,
  onSuccess: i,
  onError: o
} = {}) => {
  const e = t(!1), a = t(null), l = t(!1), f = t(null), p = () => {
    a.value = null, f.value = null;
  }, v = (n) => {
    const r = g(n);
    a.value = r.message, f.value = r, o?.(r);
  }, u = async () => {
    e.value = !0, p();
    try {
      const n = await s.verify({ routes: c });
      i?.(n);
    } catch (n) {
      v(n);
    } finally {
      e.value = !1;
    }
  };
  return d(async () => {
    if (l.value = s.isSupported(), !(!y || (s.cancel(), !await s.isAutofillSupported()))) {
      e.value = !0, p();
      try {
        const r = await s.autofill({
          routes: c
        });
        r && i?.(r);
      } catch (r) {
        v(r);
      } finally {
        e.value = !1;
      }
    }
  }), m(() => {
    s.cancel();
  }), {
    verify: u,
    isLoading: e,
    error: a,
    errorInstance: f,
    isSupported: l
  };
}, P = ({
  routes: y,
  onSuccess: c,
  onError: i
} = {}) => {
  const o = t(!1), e = t(null), a = t(!1), l = t(null);
  return d(() => {
    a.value = s.isSupported();
  }), {
    register: async (p) => {
      o.value = !0, e.value = null, l.value = null;
      try {
        await s.register({
          name: p,
          routes: y
        }), c?.();
      } catch (v) {
        const u = g(v);
        e.value = u.message, l.value = u, i?.(u);
      } finally {
        o.value = !1;
      }
    },
    isLoading: o,
    error: e,
    errorInstance: l,
    isSupported: a
  };
};
export {
  P as usePasskeyRegister,
  w as usePasskeyVerify
};
