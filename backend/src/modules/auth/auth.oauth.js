/**
 * OAuth Passport Strategies
 *
 * Implements GitHub and Google OAuth 2.0 strategies using Passport.js.
 * Both strategies follow the same pattern:
 *   1. Receive provider profile after user grants consent
 *   2. Look up user by (provider, providerId)
 *   3. If not found, check by email to auto-link an existing local account
 *   4. If still not found, create a new OAuth user with a generated username
 *   5. Call done(null, user) with the resolved Prisma user record
 */

import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import prisma from "../../config/prisma.js";
import { env } from "../../config/env.js";
import { verifyAccessToken } from "../../utils/jwt.js";
import AppError from "../../utils/appError.js";

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generates a unique, valid CodeCall username from a display name.
 * Slugifies the name (letters, numbers, underscores only), truncates to 25 chars,
 * then appends a random 4-digit suffix if the username is already taken.
 *
 * @param {string} displayName  - Raw display name from OAuth profile
 * @returns {Promise<string>}   - A unique username safe for DB insertion
 */
async function generateUniqueUsername(displayName) {
  // Slugify: keep alphanumeric + underscores, replace spaces/dashes with _
  const base = (displayName || "user")
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")          // collapse consecutive underscores
    .replace(/^_|_$/g, "")        // trim leading/trailing underscores
    .slice(0, 25)                 // max 25 chars to leave room for suffix
    || "user";

  // Try the base slug first, then add random suffixes until unique
  let candidate = base;
  let attempts = 0;

  while (attempts < 10) {
    const existing = await prisma.user.findUnique({
      where: { username: candidate },
    });
    if (!existing) return candidate;

    // Append a random 4-digit number and retry
    const suffix = Math.floor(1000 + Math.random() * 9000);
    candidate = `${base}_${suffix}`;
    attempts++;
  }

  // Last resort: uuid fragment — essentially guaranteed unique
  const { randomBytes } = await import("crypto");
  return `${base}_${randomBytes(3).toString("hex")}`;
}

/**
 * Core OAuth user resolution logic shared by both strategies.
 *
 * @param {string} provider     - "github" | "google"
 * @param {string} providerId   - Provider's unique user ID (string)
 * @param {string|null} email   - Email from provider (may be null for GitHub)
 * @param {string} displayName  - Display name from provider
 * @param {string|null} avatar  - Avatar URL from provider
 * @param {Function} done       - Passport done callback
 */
async function resolveOAuthUser(req, provider, providerId, email, displayName, avatar, done) {
  try {
    let linkingUserId = null;
    const state = req.query?.state;
    if (state) {
      try {
        const payload = verifyAccessToken(state);
        linkingUserId = payload.userId;
      } catch (err) {
        console.error("[OAuth] Invalid state token during linking:", err.message);
      }
    }

    // 1. Look up by provider-specific fields
    let existingOAuth = null;
    if (provider === "github") {
      existingOAuth = await prisma.user.findFirst({
        where: {
          OR: [
            { githubId: providerId },
            { provider: "github", providerId: providerId }
          ]
        }
      });
    } else if (provider === "google") {
      existingOAuth = await prisma.user.findFirst({
        where: {
          OR: [
            { googleId: providerId },
            { provider: "google", providerId: providerId }
          ]
        }
      });
    }

    if (existingOAuth) {
      if (linkingUserId) {
        if (existingOAuth.id !== linkingUserId) {
          return done(new AppError("This social account is already connected to another user.", 400), null);
        }
        // Already connected to the same user, just update avatar and ensure githubId/googleId is set
        const updateData = { avatar };
        if (provider === "github") {
          updateData.githubId = providerId;
        } else if (provider === "google") {
          updateData.googleId = providerId;
        }
        const updated = await prisma.user.update({
          where: { id: existingOAuth.id },
          data: updateData,
        });
        return done(null, updated);
      }

      // Logging in: update avatar and ensure githubId/googleId is set
      const updateData = { avatar };
      if (provider === "github" && !existingOAuth.githubId) {
        updateData.githubId = providerId;
      } else if (provider === "google" && !existingOAuth.googleId) {
        updateData.googleId = providerId;
      }
      const updated = await prisma.user.update({
        where: { id: existingOAuth.id },
        data: updateData,
      });
      return done(null, updated);
    }

    // If we are linking a new provider but no user exists with this providerId yet
    if (linkingUserId) {
      const currentUser = await prisma.user.findUnique({
        where: { id: linkingUserId }
      });
      if (!currentUser) {
        return done(new AppError("User not found.", 404), null);
      }

      // Verify email matches
      if (!email) {
        return done(new AppError("OAuth account does not have a verified email address.", 400), null);
      }
      if (email.toLowerCase() !== currentUser.email.toLowerCase()) {
        return done(new AppError("The email of this social account does not match your CodeCall account email.", 400), null);
      }

      const updateData = { avatar, isOAuthUser: true };
      if (provider === "github") {
        updateData.githubId = providerId;
      } else if (provider === "google") {
        updateData.googleId = providerId;
      }

      const linked = await prisma.user.update({
        where: { id: linkingUserId },
        data: updateData,
      });
      return done(null, linked);
    }

    // 2. If we have an email, try to link to an existing local/OAuth account
    if (email) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingByEmail) {
        const updateData = { avatar, isOAuthUser: true };
        if (provider === "github") {
          updateData.githubId = providerId;
        } else if (provider === "google") {
          updateData.googleId = providerId;
        }
        // Link the OAuth provider to the existing account
        const linked = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: updateData,
        });
        return done(null, linked);
      }
    }

    // 3. Create a brand-new OAuth user
    const username = await generateUniqueUsername(displayName);

    const createData = {
      username,
      email: email || null,
      fullName: displayName || null,
      password: null,          // OAuth users have no password
      provider,
      providerId,
      avatar,
      isOAuthUser: true,
    };
    if (provider === "github") {
      createData.githubId = providerId;
    } else if (provider === "google") {
      createData.googleId = providerId;
    }

    const newUser = await prisma.user.create({
      data: createData,
    });

    return done(null, newUser);
  } catch (err) {
    return done(err, null);
  }
}

// ─── GitHub Strategy ─────────────────────────────────────────────────────────

export const githubStrategy = new GitHubStrategy(
  {
    clientID: env.GITHUB_CLIENT_ID || "placeholder",
    clientSecret: env.GITHUB_CLIENT_SECRET || "placeholder",
    callbackURL: `${process.env.RENDER_EXTERNAL_URL || "http://localhost:5000"}/api/auth/github/callback`,
    scope: ["user:email"],        // request email access
    passReqToCallback: true,      // allows req.query in strategy verification
  },
  async (req, accessToken, refreshToken, profile, done) => {
    // GitHub may return multiple emails; prefer the primary + verified one
    const emailObj =
      profile.emails?.find((e) => e.primary && e.verified) ||
      profile.emails?.[0];

    const email = emailObj?.value || null;
    const avatar = profile.photos?.[0]?.value || null;
    const displayName = profile.displayName || profile.username || "github_user";

    await resolveOAuthUser(req, "github", profile.id, email, displayName, avatar, done);
  }
);

// ─── Google Strategy ─────────────────────────────────────────────────────────

export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID || "placeholder",
    clientSecret: env.GOOGLE_CLIENT_SECRET || "placeholder",
    callbackURL: `${process.env.RENDER_EXTERNAL_URL || "http://localhost:5000"}/api/auth/google/callback`,
    scope: ["profile", "email"],
    passReqToCallback: true,      // allows req.query in strategy verification
  },
  async (req, accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value || null;
    const avatar = profile.photos?.[0]?.value || null;
    const displayName = profile.displayName || "google_user";

    await resolveOAuthUser(req, "google", profile.id, email, displayName, avatar, done);
  }
);
