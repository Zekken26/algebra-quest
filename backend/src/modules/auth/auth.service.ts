import { UserRole } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../../config/env";
import { prisma } from "../../config/prisma";
import { AppError } from "../../utils/AppError";

const PASSWORD_SALT_ROUNDS = 12;

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatarUrl?: string;
};

type LoginInput = {
  email: string;
  password: string;
};

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  xp: true,
  coins: true,
  hintTokens: true,
  hearts: true,
  createdAt: true,
  updatedAt: true,
};

function signToken(user: { id: string; email: string; role: UserRole }) {
  const options: SignOptions = { expiresIn: env.jwtExpiresIn as SignOptions["expiresIn"] };

  return jwt.sign({ sub: user.id, email: user.email, role: user.role }, env.jwtSecret, {
    ...options,
  });
}

export async function register(input: RegisterInput) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });

  if (existingUser) {
    throw new AppError("A user with this email already exists.", 409, "EMAIL_ALREADY_EXISTS");
  }

  const password = await bcrypt.hash(input.password, PASSWORD_SALT_ROUNDS);
  const user = await prisma.user.create({
    data: { ...input, password },
    select: publicUserSelect,
  });

  return { user, accessToken: signToken(user) };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  const passwordMatches = await bcrypt.compare(input.password, user.password);

  if (!passwordMatches) {
    throw new AppError("Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const { password: _password, ...safeUser } = user;
  return { user: { ...safeUser, lastLoginAt: new Date() }, accessToken: signToken(user) };
}

export async function me(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: publicUserSelect,
  });

  if (!user) {
    throw new AppError("Authenticated user no longer exists.", 401, "AUTH_USER_NOT_FOUND");
  }

  return user;
}
