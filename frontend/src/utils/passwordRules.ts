export const passwordRequirements = [
  {
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
  },
  {
    label: 'At least 1 uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
  },
  {
    label: 'At least 1 number',
    test: (password: string) => /\d/.test(password),
  },
  {
    label: 'At least 1 special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
  },
];

export const arePasswordRequirementsMet = (password: string) =>
  passwordRequirements.every((r) => r.test(password));
