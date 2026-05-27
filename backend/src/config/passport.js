/**
 * Passport Strategy Registration
 *
 * Import this file once as a side-effect (e.g. in app.js) to register
 * both OAuth strategies. Passport is used in stateless mode — no sessions.
 */
import passport from "passport";
import { githubStrategy, googleStrategy } from "../modules/auth/auth.oauth.js";

passport.use(githubStrategy);
passport.use(googleStrategy);

export default passport;
