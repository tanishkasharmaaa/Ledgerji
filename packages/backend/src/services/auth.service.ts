import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import prisma from '../lib/prisma';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  TokenPayload,
} from '../lib/jwt';
import { AppError } from '../middleware/error.middleware';
import type { RegisterInput, LoginInput, UpdateProfileInput } from '../lib/validators';

export class AuthService {
  // ---- Register ----
  static async register(input: RegisterInput) {
    const { name, email, phone, password, businessName } = input;
console.log(name,email,phone,password,businessName)
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new AppError('An account with this email already exists', 409);
    }
   
    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, phone, passwordHash, businessName },
      select: { id: true, name: true, email: true, phone: true, businessName: true, createdAt: true },
    });

    const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    return { user, accessToken, refreshToken };
  }

  // ---- Login ----
  static async login(input: LoginInput) {
    const { email, password } = input;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.passwordHash) {
      throw new AppError('Invalid email or password', 401);
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError('Invalid email or password', 401);
    }

    const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    const { passwordHash: _, refreshToken: __, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, accessToken, refreshToken };
  }

  // ---- Refresh Token ----
  static async refreshTokens(refreshToken: string) {
    try {
      const decoded = verifyRefreshToken(refreshToken);
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401);
      }

      const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
      const newAccessToken = generateAccessToken(tokenPayload);
      const newRefreshToken = generateRefreshToken(tokenPayload);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshToken: newRefreshToken },
      });

      return { accessToken: newAccessToken, refreshToken: newRefreshToken };
    } catch {
      throw new AppError('Session expired. Please log in again', 401);
    }
  }

  // ---- Logout ----
  static async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  }

  // ---- Get Profile ----
  static async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, name: true, email: true, phone: true,
        businessName: true, upiId: true, avatarUrl: true,
        isVerified: true, createdAt: true, updatedAt: true,
      },
    });
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  // ---- Update Profile ----
  static async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: input,
      select: {
        id: true, name: true, email: true, phone: true,
        businessName: true, upiId: true, avatarUrl: true,
        isVerified: true, createdAt: true, updatedAt: true,
      },
    });
    return user;
  }

  // ---- Google OAuth ----
  static async googleAuth(profile: { googleId: string; name: string; email: string; avatarUrl?: string }) {
    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    if (user) {
      // Link Google if not already linked
      if (!user.googleId) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { googleId: profile.googleId, avatarUrl: profile.avatarUrl },
        });
      }
    } else {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          avatarUrl: profile.avatarUrl,
          isVerified: true,
        },
      });
    }

    const tokenPayload: TokenPayload = { userId: user.id, email: user.email };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken, lastLoginAt: new Date() },
    });

    const { passwordHash: _, refreshToken: __, ...userWithoutSensitive } = user;
    return { user: userWithoutSensitive, accessToken, refreshToken };
  }
}