export const ADMIN_ROLE = "admin";

type ClerkLikeUser = {
  publicMetadata?: Record<string, unknown>;
} | null | undefined;

export function isAdminUser(user: ClerkLikeUser): boolean {
  return user?.publicMetadata?.role === ADMIN_ROLE;
}
