export const COOLDOWN_KEYS = {
  verification: (email: string) => `cooldown:verification:${email}`,
  forgotPassword: (email: string) => `cooldown:forgotPassword:${email}`,
};
