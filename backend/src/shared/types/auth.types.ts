export type UserRole = "STUDENT" | "TEACHER";

export type AuthTokenPayload = {
  sub: string;
  role: UserRole;
  email: string;
};
