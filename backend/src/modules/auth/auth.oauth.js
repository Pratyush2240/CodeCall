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
async function resolveOAuthUser(provider, providerId, email, displayName, avatar, done) {
  try {
    // 1. Look up by provider + providerId (existing OAuth user)
    const existingOAuth = await prisma.user.findUnique({
      where: {
        // Prisma generates this compound unique field name from @@unique([provider, providerId])
        provider_providerId: { provider, providerId },
      },
    });

    if (existingOAuth) {
      // Update avatar in case it changed
      const updated = await prisma.user.update({
        where: { id: existingOAuth.id },
        data: { avatar },
      });
      return done(null, updated);
    }

    // 2. If we have an email, try to link to an existing local account
    if (email) {
      const existingByEmail = await prisma.user.findUnique({ where: { email } });

      if (existingByEmail) {
        // Link the OAuth provider to the existing account
        const linked = await prisma.user.update({
          where: { id: existingByEmail.id },
          data: { provider, providerId, avatar, isOAuthUser: true },
        });
        return done(null, linked);
      }
    }

    // 3. Create a brand-new OAuth user
    const username = await generateUniqueUsername(displayName);

    const newUser = await prisma.user.create({
      data: {
        username,
        email: email || null,
        fullName: displayName || null,
        password: null,          // OAuth users have no password
        provider,
        providerId,
        avatar,
        isOAuthUser: true,
      },
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
    callbackURL: "http://localhost:5000/api/auth/github/callback",
    scope: ["user:email"],        // request email access
  },
  async (accessToken, refreshToken, profile, done) => {
    // GitHub may return multiple emails; prefer the primary + verified one
    const emailObj =
      profile.emails?.find((e) => e.primary && e.verified) ||
      profile.emails?.[0];

    const email = emailObj?.value || null;
    const avatar = profile.photos?.[0]?.value || null;
    const displayName = profile.displayName || profile.username || "github_user";

    await resolveOAuthUser("github", profile.id, email, displayName, avatar, done);
  }
);

// ─── Google Strategy ─────────────────────────────────────────────────────────

export const googleStrategy = new GoogleStrategy(
  {
    clientID: env.GOOGLE_CLIENT_ID || "placeholder",
    clientSecret: env.GOOGLE_CLIENT_SECRET || "placeholder",
    callbackURL: "http://localhost:5000/api/auth/google/callback",
    scope: ["profile", "email"],
  },
  async (accessToken, refreshToken, profile, done) => {
    const email = profile.emails?.[0]?.value || null;
    const avatar = profile.photos?.[0]?.value || null;
    const displayName = profile.displayName || "google_user";

    await resolveOAuthUser("google", profile.id, email, displayName, avatar, done);
  }
);
