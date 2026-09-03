export function validateEnv() {
  const missing: string[] = [];
  if (!process.env.POSTGRES_URL_NON_POOLING && !process.env.DATABASE_URL) missing.push("POSTGRES_URL_NON_POOLING or DATABASE_URL");
  if (missing.length) {
    console.warn("Missing critical environment variables:", missing.join(", "));
  }
  return missing.length === 0;
}

export default validateEnv;
