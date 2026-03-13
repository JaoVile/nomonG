const firstQueryValue = (value: unknown): string | undefined => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0];
  return undefined;
};

export const queryString = (value: unknown, fallback = ''): string => {
  const selected = firstQueryValue(value)?.trim();
  if (!selected) return fallback;
  return selected;
};

export const queryBoolean = (value: unknown, fallback = false): boolean => {
  const selected = firstQueryValue(value)?.trim().toLowerCase();
  if (!selected) return fallback;

  if (['1', 'true', 'yes', 'y', 'on'].includes(selected)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(selected)) return false;
  return fallback;
};

