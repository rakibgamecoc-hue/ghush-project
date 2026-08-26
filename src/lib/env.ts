export function validateEnv() {
  const missing: string[] = [];
  if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.DATABASE_URL) missing.push("POSTGRES_URL_NON_POOLING or DATABASE_URL");
  // Upstash is optional, Gemini API key optional but warn
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    // not fatal
  }
  if (missing.length) {
    console.warn("Missing critical environment variables:", missing.join(", "));
  }
  return missing.length === 0;
}

export default validateEnv;
