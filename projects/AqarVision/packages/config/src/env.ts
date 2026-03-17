import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  AI_BACKEND_URL: z.string().url().default("http://localhost:8000"),
  AI_SERVICE_KEY: z.string().min(1),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
  SENTRY_DSN: z.string().url().optional(),
  LOG_LEVEL: z
    .enum(["debug", "info", "warn", "error"])
    .default("info"),
});

const envSchema = publicEnvSchema.merge(serverEnvSchema);

export type PublicEnv = z.infer<typeof publicEnvSchema>;
export type ServerEnv = z.infer<typeof serverEnvSchema>;
export type Env = z.infer<typeof envSchema>;

function createEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(", ")}`)
      .join("\n");

    throw new Error(`Missing or invalid environment variables:\n${message}`);
  }

  return parsed.data;
}

function createPublicEnv(): PublicEnv {
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env["NEXT_PUBLIC_SUPABASE_URL"],
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env["NEXT_PUBLIC_SUPABASE_ANON_KEY"],
  });

  if (!parsed.success) {
    const formatted = parsed.error.flatten().fieldErrors;
    const message = Object.entries(formatted)
      .map(([key, errors]) => `  ${key}: ${(errors ?? []).join(", ")}`)
      .join("\n");

    throw new Error(`Missing or invalid public environment variables:\n${message}`);
  }

  return parsed.data;
}

/** Lazy singleton — defers validation until first access (safe for Edge Runtime & tests) */
let _env: Env | undefined;

export function getEnv(): Env {
  if (!_env) {
    _env = createEnv();
  }
  return _env;
}

/**
 * Validated environment (all vars, server-side only).
 * Proxy-based so `env.SOME_VAR` reads are lazy — `createEnv()` is not called at module load time.
 */
export const env = new Proxy({} as Env, {
  get(_target, prop) {
    return getEnv()[prop as keyof Env];
  },
  has(_target, prop) {
    return prop in getEnv();
  },
  ownKeys() {
    return Object.keys(getEnv());
  },
  getOwnPropertyDescriptor(_target, prop) {
    const value = getEnv()[prop as keyof Env];
    if (value === undefined) return undefined;
    return { value, writable: false, enumerable: true, configurable: true };
  },
});

/** Validated public environment (safe for client-side) */
export const publicEnv: PublicEnv = createPublicEnv();

export { envSchema, publicEnvSchema, serverEnvSchema };
