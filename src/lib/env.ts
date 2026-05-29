const coerceBoolean = (value: string | undefined, fallback: boolean) => {
  if (value === undefined) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

export const env = {
  DATABASE_URL: process.env.DATABASE_URL,
  BETTER_AUTH_SECRET:
    process.env.BETTER_AUTH_SECRET ?? "development-secret-change-me",
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  HOTELSURVEY_API_URL:
    process.env.HOTELSURVEY_API_URL ?? "https://api.kreatinmedya.com",
  HOTELSURVEY_GUEST_VERIFY_URL: process.env.HOTELSURVEY_GUEST_VERIFY_URL,
  HOTELSURVEY_API_STUB: coerceBoolean(
    process.env.HOTELSURVEY_API_STUB,
    true,
  ),
};

export const hasDatabaseUrl = Boolean(env.DATABASE_URL);
