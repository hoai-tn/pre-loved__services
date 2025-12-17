export const AUTH_MESSAGE_PATTERNS = {
  CREATE_USER_AUTH_TOKEN: 'create-user-auth-token',
} as const;

export type AuthMessagePattern =
  (typeof AUTH_MESSAGE_PATTERNS)[keyof typeof AUTH_MESSAGE_PATTERNS];
