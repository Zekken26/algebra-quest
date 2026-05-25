import { clearAuth, getAuth } from "@/shared/services/api";

export function useAuth() {
  return {
    user: getAuth(),
    isAuthenticated: Boolean(getAuth()),
    signOut: clearAuth,
  };
}
