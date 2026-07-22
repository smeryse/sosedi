// ─── Browser-side token helper ────────────────────────────────────────────

type DecodedUser = {
  id: string;
  email: string;
  display_name?: string;
  aud?: string;
  created_at?: string;
  app_metadata?: any;
  user_metadata?: any;
  identities?: any[];
};

type TokenMetadata = Record<string, unknown>;

type BrowserSession = {
  user: DecodedUser;
  access_token: string;
  token_type: "bearer";
};

type AuthStateListener = (
  event: "INITIAL_SESSION" | "SIGNED_IN" | "SIGNED_OUT" | "USER_UPDATED",
  session: BrowserSession | null,
) => void;

const authStateListeners = new Set<AuthStateListener>();

export function readAuthCookie(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/auth-token=([^;]+)/);
  return match?.[1] ?? null;
}

export function readAuthToken(): string | null {
  const explicit = typeof window !== "undefined" ? window.localStorage?.getItem("auth-token") : null;
  return explicit || readAuthCookie();
}

function currentBrowserSession(): BrowserSession | null {
  const accessToken = readAuthToken();
  const user = verifyToken(accessToken);
  return user && accessToken
    ? { user, access_token: accessToken, token_type: "bearer" }
    : null;
}

function notifyAuthStateListeners(
  event: Parameters<AuthStateListener>[0],
  session: BrowserSession | null,
) {
  authStateListeners.forEach((listener) => listener(event, session));
}

export function persistAuthToken(token: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("auth-token", token);
  notifyAuthStateListeners("SIGNED_IN", currentBrowserSession());
}

export function verifyToken(token: string | null): DecodedUser | null {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const jsonPayload = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (
      !decoded?.sub
      || !decoded?.email
      || (typeof decoded.exp === "number" && decoded.exp * 1000 <= Date.now())
    ) return null;
    const embeddedMetadata: TokenMetadata = decoded.user_metadata
      && typeof decoded.user_metadata === "object"
      && !Array.isArray(decoded.user_metadata)
      ? decoded.user_metadata
      : {};
    const displayName = typeof embeddedMetadata.display_name === "string"
      ? embeddedMetadata.display_name
      : typeof decoded.display_name === "string"
        ? decoded.display_name
        : "";
    const role = typeof embeddedMetadata.role === "string"
      ? embeddedMetadata.role
      : typeof decoded.role === "string"
        ? decoded.role
        : undefined;
    const onboardingCompleted = typeof embeddedMetadata.onboarding_completed === "boolean"
      ? embeddedMetadata.onboarding_completed
      : typeof decoded.onboarding_completed === "boolean"
        ? decoded.onboarding_completed
        : undefined;
    const userMetadata: TokenMetadata = {
      ...embeddedMetadata,
      display_name: displayName,
      ...(role ? { role } : {}),
      ...(onboardingCompleted !== undefined
        ? { onboarding_completed: onboardingCompleted }
        : {}),
    };

    return {
      id: decoded.sub,
      email: decoded.email,
      display_name: displayName,
      user_metadata: userMetadata,
      app_metadata: decoded.app_metadata && typeof decoded.app_metadata === "object"
        ? decoded.app_metadata
        : {},
      aud: "authenticated",
      created_at: new Date().toISOString(),
      identities: [],
    };
  } catch {
    return null;
  }
}

class ClientQueryBuilder {
  private table: string;
  private method: string = "select";
  private selectCols: string = "*";
  private insertRows: any[] = [];
  private updateValues: any = null;
  private eqConditions: { col: string; val: any }[] = [];
  private neqConditions: { col: string; val: any }[] = [];
  private inConditions: { col: string; vals: any[] }[] = [];
  private isConditions: { col: string; val: any }[] = [];
  private gteConditions: { col: string; val: any }[] = [];
  private lteConditions: { col: string; val: any }[] = [];
  private ilikeConditions: { col: string; val: string }[] = [];
  private limitVal: number | null = null;
  private orderByCol: string | null = null;
  private orderAscending: boolean = true;
  private isSingleRow: boolean = false;
  private isMaybeSingleRow: boolean = false;
  private onConflictColumns: string = "";

  constructor(table: string) {
    this.table = table;
  }

  select(cols: string = "*") {
    this.selectCols = cols;
    return this;
  }

  insert(values: any) {
    this.method = "insert";
    this.insertRows = Array.isArray(values) ? values : [values];
    return this;
  }

  update(values: any) {
    this.method = "update";
    this.updateValues = values;
    return this;
  }

  upsert(values: any, options?: any) {
    this.method = "upsert";
    this.insertRows = Array.isArray(values) ? values : [values];
    this.onConflictColumns = options?.onConflict || "";
    return this;
  }

  eq(col: string, val: any) {
    this.eqConditions.push({ col, val });
    return this;
  }

  neq(col: string, val: any) {
    this.neqConditions.push({ col, val });
    return this;
  }

  in(col: string, vals: any[]) {
    this.inConditions.push({ col, vals });
    return this;
  }

  is(col: string, val: any) {
    this.isConditions.push({ col, val });
    return this;
  }

  gte(col: string, val: any) {
    this.gteConditions.push({ col, val });
    return this;
  }

  lte(col: string, val: any) {
    this.lteConditions.push({ col, val });
    return this;
  }

  ilike(col: string, val: string) {
    this.ilikeConditions.push({ col, val });
    return this;
  }

  limit(val: number) {
    this.limitVal = val;
    return this;
  }

  order(col: string, options?: { ascending?: boolean }) {
    this.orderByCol = col;
    this.orderAscending = options?.ascending ?? true;
    return this;
  }

  or(filters: string) {
    return this;
  }

  single() {
    this.isSingleRow = true;
    return this;
  }

  maybeSingle() {
    this.isMaybeSingleRow = true;
    return this;
  }

  async execute() {
    try {
      const token = readAuthToken();
      const res = await fetch("/api/db", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          table: this.table,
          method: this.method,
          selectCols: this.selectCols,
          insertRows: this.insertRows,
          updateValues: this.updateValues,
          eqConditions: this.eqConditions,
          neqConditions: this.neqConditions,
          inConditions: this.inConditions,
          isConditions: this.isConditions,
          gteConditions: this.gteConditions,
          lteConditions: this.lteConditions,
          ilikeConditions: this.ilikeConditions,
          limitVal: this.limitVal,
          orderByCol: this.orderByCol,
          orderAscending: this.orderAscending,
          isSingleRow: this.isSingleRow,
          isMaybeSingleRow: this.isMaybeSingleRow,
          onConflictColumns: this.onConflictColumns,
        }),
      });
      const json = await res.json();
      return json;
    } catch (err: any) {
      return { data: null, error: { message: err.message } };
    }
  }

  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

export function createClient() {
  return {
    auth: {
      getUser: async () => ({ data: { user: currentBrowserSession()?.user ?? null }, error: null }),
      getSession: async () => ({ data: { session: currentBrowserSession() }, error: null }),
      signInWithPassword: async ({ email, password }: any) => {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "login", email, password }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to sign in");
          
          if (typeof window !== "undefined" && json.data?.session?.access_token) {
            persistAuthToken(json.data.session.access_token);
          }
          return { data: json.data, error: null };
        } catch (err: any) {
          return { data: { user: null, session: null }, error: err };
        }
      },
      signUp: async ({ email, password, options }: any) => {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "signup", email, password, options }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to sign up");
          
          if (typeof window !== "undefined" && json.data?.session?.access_token) {
            persistAuthToken(json.data.session.access_token);
          }
          return { data: json.data, error: null };
        } catch (err: any) {
          return { data: { user: null, session: null }, error: err };
        }
      },
      updateUser: async (attributes: any) => {
        try {
          const res = await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "updateUser", attributes }),
          });
          const json = await res.json();
          if (!res.ok) throw new Error(json.error || "Failed to update user");
          notifyAuthStateListeners("USER_UPDATED", currentBrowserSession());
          return { data: json.data, error: null };
        } catch (err: any) {
          return { data: { user: null }, error: err };
        }
      },
      signOut: async (options?: any) => {
        try {
          await fetch("/api/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "logout" }),
          });
          if (typeof window !== "undefined") {
            window.localStorage.removeItem("auth-token");
          }
          notifyAuthStateListeners("SIGNED_OUT", null);
          return { error: null };
        } catch (err: any) {
          return { error: err };
        }
      },
      onAuthStateChange: (callback: AuthStateListener) => {
        authStateListeners.add(callback);
        queueMicrotask(() => callback("INITIAL_SESSION", currentBrowserSession()));
        return {
          data: {
            subscription: {
              unsubscribe: () => authStateListeners.delete(callback),
            }
          }
        };
      },
      unlinkIdentity: async (identity: any) => ({ data: {}, error: null }),
      verifyOtp: async (args: any) => ({ data: { session: null, user: null }, error: null }),
      resetPasswordForEmail: async (email: string, options?: any) => ({ data: {}, error: null }),
      getClaims: async () => {
        const user = currentBrowserSession()?.user;
        if (!user) return { data: null, error: null };

        return {
          data: {
            claims: {
              sub: user.id,
              email: user.email,
              role: user.user_metadata?.role,
              onboarding_completed: user.user_metadata?.onboarding_completed,
              user_metadata: user.user_metadata ?? {},
            },
          },
          error: null,
        };
      },
      get mfa() {
        return {
          listFactors: async () => ({ data: { all: [], totp: [] }, error: null }),
          getAuthenticatorAssuranceLevel: async () => ({ data: { currentLevel: "aal1", nextLevel: "aal1" }, error: null }),
          unenroll: async (args: any) => ({ data: {}, error: null }),
          enroll: async (args: any) => ({ data: {}, error: null }),
          challengeAndVerify: async (args: any) => ({ data: {}, error: null }),
        };
      },
      get admin() {
        return {
          deleteUser: async (id: string) => ({ data: {}, error: null }),
          revokeRefreshToken: async (token: string) => ({ data: {}, error: null }),
        };
      }
    },
    from(table: string) {
      return new ClientQueryBuilder(table);
    },
    channel(name: string) {
      const obj = {
        on: (event: string, filter: any, callback: any) => {
          return obj;
        },
        subscribe: (cb?: (status: string) => void) => {
          if (cb) cb("SUBSCRIBED");
        }
      };
      return obj;
    },
    removeChannel(channel: any) {},
    rpc(fn: string, args: Record<string, any> = {}) {
      return {
        then: async (onfulfilled?: any, onrejected?: any) => {
          try {
            const token = readAuthToken();
            const res = await fetch("/api/db", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ rpc: fn, args }),
            });
            const json = res.ok ? await res.json() : { data: null, error: { message: "RPC failed" } };
            if (onfulfilled) return onfulfilled(json);
            return json;
          } catch (err: any) {
            if (onrejected) return onrejected(err);
            return { data: null, error: { message: err.message } };
          }
        }
      };
    },
    storage: {
      from: (bucket: string) => {
        return {
          createSignedUploadUrl: async (path: string, options?: any) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "createSignedUploadUrl", path, options }),
            });
            return res.json();
          },
          getPublicUrl: (path: string) => {
            const publicUrl = `/uploads/${bucket}/${path}`;
            return { data: { publicUrl } };
          },
          createSignedUrl: async (path: string, expiresIn: number) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "createSignedUrl", path, expiresIn }),
            });
            return res.json();
          },
          upload: async (path: string, fileBody: any, fileOptions?: any) => {
            const token = readAuthToken();
            const fd = new FormData();
            fd.append("file", fileBody);
            fd.append("bucket", bucket);
            fd.append("path", path);
            const res = await fetch(`/api/storage/upload`, {
              method: "POST",
              headers: {
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: fd,
            });
            return res.json();
          },
          remove: async (paths: string[]) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "remove", paths }),
            });
            return res.json();
          },
          list: async (folderPath: string, options?: any) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "list", folderPath, options }),
            });
            return res.json();
          },
          download: async (path: string) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "download", path }),
            });
            if (!res.ok) return { data: null, error: { message: "Download failed" } };
            const blob = await res.blob();
            return { data: blob, error: null };
          },
          info: async (path: string) => {
            const token = readAuthToken();
            const res = await fetch(`/api/storage/action`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": token ? `Bearer ${token}` : "",
              },
              body: JSON.stringify({ bucket, action: "info", path }),
            });
            return res.json();
          }
        };
      }
    }
  };
}
