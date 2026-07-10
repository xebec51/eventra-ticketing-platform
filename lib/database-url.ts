const SSL_MODE_ALIASES = new Set(["prefer", "require", "verify-ca"]);

function isLibpqCompatEnabled(value: string | null) {
  return value?.toLowerCase() === "true";
}

export function getDatabaseUrl() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured.");
  }

  const url = new URL(connectionString);
  const sslMode = url.searchParams.get("sslmode")?.toLowerCase() ?? null;
  const useLibpqCompat = url.searchParams.get("uselibpqcompat");

  if (sslMode && SSL_MODE_ALIASES.has(sslMode) && !isLibpqCompatEnabled(useLibpqCompat)) {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}
