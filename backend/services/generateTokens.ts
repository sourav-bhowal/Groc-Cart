import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config/config";
import type { IUser } from "../models/user.models";
import jwt from "jsonwebtoken";

/**
 * Generates access and refresh tokens for a user.
 * @param {IUser} user - The user object containing user details.
 * @returns {Object} An object containing the access and refresh tokens.
 */

export const generateTokens = async (
  user: IUser
): Promise<{ accessToken: string; refreshToken: string }> => {
  if (!user || !user._id || !user.role) {
    throw new Error("Invalid user object provided for token generation.");
  }

  // Generate access token with user ID and role
  const accessToken = jwt.sign(
    { userId: user._id, role: user.role },
    ACCESS_TOKEN_SECRET,
    { expiresIn: "1d" }
  );

  // Generate refresh token with user ID and role
  const refreshToken = jwt.sign(
    { userId: user._id, role: user.role },
    REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );

  // Return both tokens
  return {
    accessToken,
    refreshToken,
  };
};
