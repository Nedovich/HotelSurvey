export const APP_TIME_ZONE = "Europe/Istanbul";
export const APP_LOCALE = "en-US";

const formatWithOptions = (
  value: Date,
  options: Intl.DateTimeFormatOptions,
) =>
  new Intl.DateTimeFormat(APP_LOCALE, {
    timeZone: APP_TIME_ZONE,
    ...options,
  }).format(value);

export const formatAppDate = (value: Date) =>
  formatWithOptions(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

export const formatAppTime = (value: Date) =>
  formatWithOptions(value, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

export const formatAppDateTime = (value: Date) =>
  formatWithOptions(value, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

const getAppDateKey = (value: Date) =>
  formatWithOptions(value, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const isSameAppDay = (left: Date, right: Date) =>
  getAppDateKey(left) === getAppDateKey(right);
