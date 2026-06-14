export const ADMIN_ROLE = "admin";

export const clerkAppearance = {
  variables: {
    colorPrimary: "#2dd4bf",
    colorBackground: "#0c1219",
    colorInputBackground: "#141c26",
    colorText: "#e8f0f5",
    colorTextSecondary: "#8ba3b8",
    borderRadius: "0.625rem",
  },
  elements: {
    card: {
      backgroundColor: "#141c26",
      boxShadow: "none",
      border: "1px solid oklch(0.30 0.058 215 / 42%)",
    },
  },
};

type ClerkLikeUser = {
  publicMetadata?: Record<string, unknown>;
} | null | undefined;

export function isAdminUser(user: ClerkLikeUser): boolean {
  return user?.publicMetadata?.role === ADMIN_ROLE;
}
