export const checkCooldown = (
  lastSent: Date | undefined,
  cooldownMs: number,
) => {
  if (!lastSent) return { allowed: true };

  const elapsed = Date.now() - new Date(lastSent).getTime();

  if (elapsed < cooldownMs) {
    return {
      allowed: false,
      retryAfter: Math.ceil((cooldownMs - elapsed) / 1000),
    };
  }

  return { allowed: true };
};

export const getProgressiveCooldown = (attempts: number) => {
  if (attempts === 0) return 30_000;
  if (attempts === 1) return 60_000;
  if (attempts === 2) return 120_000;
  return 300_000;
};

export const shouldResetAttempts = (
  lastSent: Date | undefined,
  windowMs: number,
) => {
  if (!lastSent) return false;

  const elapsed = Date.now() - new Date(lastSent).getTime();

  return elapsed > windowMs;
};
