/**
 * Typed env loader for the mobile app.
 *
 * - Reads only `EXPO_PUBLIC_*` variables (those are the only ones Expo bundles to the client).
 * - Anonymous key is intentionally safe to ship — RLS guarantees row-level protection.
 * - Returns `{ mode: 'demo' | 'live' }`: when Supabase env is missing, the rest of the app
 *   keeps using the existing mock store (matches the web app's DemoRepository fallback).
 * - Throws `MissingEnvError` only when `EXPO_PUBLIC_REQUIRE_LIVE=true` and a value is missing,
 *   so demo / unit-test runs never crash the app on import.
 */

export type MobileEnvMode = 'demo' | 'live';

export type EnvSource = NodeJS.ProcessEnv | Record<string, string | undefined>;

export interface MobileEnv {
  readonly mode: MobileEnvMode;
  readonly supabaseUrl: string | null;
  readonly supabaseAnonKey: string | null;
  readonly demoMode: boolean;
  readonly requireLive: boolean;
}

export class MissingEnvError extends Error {
  public override readonly name = 'MissingEnvError';
  public readonly variable: string;

  public constructor(variable: string) {
    super(`Missing required environment variable: ${variable}`);
    this.variable = variable;
  }
}

type StringSource = EnvSource;

const readString = (source: StringSource, name: string): string | null => {
  const raw = source[name];
  if (raw === undefined || raw === null || raw.length === 0) return null;
  return raw;
};

const readBoolean = (source: StringSource, name: string, fallback: boolean): boolean => {
  const raw = readString(source, name);
  if (raw === null) return fallback;
  const normalized = raw.trim().toLowerCase();
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true;
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false;
  return fallback;
};

export const loadMobileEnv = (source: EnvSource = process.env): MobileEnv => {
  const supabaseUrl = readString(source, 'EXPO_PUBLIC_SUPABASE_URL');
  const supabaseAnonKey = readString(source, 'EXPO_PUBLIC_SUPABASE_ANON_KEY');
  const demoMode = readBoolean(source, 'EXPO_PUBLIC_DEMO_MODE', false);
  const requireLive = readBoolean(source, 'EXPO_PUBLIC_REQUIRE_LIVE', false);

  if (requireLive) {
    if (!supabaseUrl) throw new MissingEnvError('EXPO_PUBLIC_SUPABASE_URL');
    if (!supabaseAnonKey) throw new MissingEnvError('EXPO_PUBLIC_SUPABASE_ANON_KEY');
  }

  const hasLiveCredentials = Boolean(supabaseUrl && supabaseAnonKey);
  const mode: MobileEnvMode = hasLiveCredentials && !demoMode ? 'live' : 'demo';

  return {
    mode,
    supabaseUrl,
    supabaseAnonKey,
    demoMode: mode === 'demo',
    requireLive,
  };
};

let cached: MobileEnv | null = null;

/**
 * Memoized accessor for the runtime env. Caches the value on first read so that
 * tests can stub the source before the first call and observe stable results.
 */
export const getMobileEnv = (
  overrideSource?: EnvSource,
): MobileEnv => {
  if (cached === null || overrideSource !== undefined) {
    return loadMobileEnv(overrideSource);
  }
  return cached;
};

/** Reset the memoized env — only intended for tests. */
export const __resetMobileEnvCache = (): void => {
  cached = null;
};

export const isLiveMode = (env: MobileEnv = getMobileEnv()): boolean =>
  env.mode === 'live';
