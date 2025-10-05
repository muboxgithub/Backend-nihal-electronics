const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const jwt = require('jsonwebtoken');
const bcrypt = require("bcrypt");
const { PrismaClient } = require("../generated/prisma");
const prisma = new PrismaClient();
require('dotenv').config();

const generateToken = (user) => {
  return jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Google Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find existing user by socialId or email
    let user = await prisma.users.findFirst({
      where: { OR: [{ socialId: profile.id }, { email: profile.emails[0]?.value }] }
    });

    if (!user) {
      // Create new user (OAuth-only, no password)
      user = await prisma.users.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0]?.value,
          role: 'customer',  // Default role
          provider: 'google',
          socialId: profile.id,
          phone: null  // Optional: Fetch from profile if available
        }
      });
    } else if (!user.provider) {
      // Link existing email/password user to Google
      await prisma.users.update({
        where: { user_id: user.user_id },
        data: { provider: 'google', socialId: profile.id }
      });
    }

    const token = generateToken(user);
    done(null, { user, token });
  } catch (error) {
    console.error('Google auth error:', error);
    done(error, null);
  }
}));

// Facebook Strategy
passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'displayName', 'emails']  // Fetch needed fields
}, async (accessToken, refreshToken, profile, done) => {
  try {
    // Find existing user by socialId or email
    let user = await prisma.users.findFirst({
      where: { OR: [{ socialId: profile.id }, { email: profile.emails[0]?.value }] }
    });

    if (!user) {
      // Create new user
      user = await prisma.users.create({
        data: {
          name: profile.displayName,
          email: profile.emails[0]?.value,
          role: 'customer',  // Default role
          provider: 'facebook',
          socialId: profile.id,
          phone: null
        }
      });
    } else if (!user.provider) {
      // Link existing
      await prisma.users.update({
        where: { user_id: user.user_id },
        data: { provider: 'facebook', socialId: profile.id }
      });
    }

    const token = generateToken(user);
    done(null, { user, token });
  } catch (error) {
    console.error('Facebook auth error:', error);
    done(error, null);
  }
}));

// Serialize/Deserialize users (for Passport session if needed; minimal for JWT)
passport.serializeUser((user, done) => done(null, user.user_id));
passport.deserializeUser(async (id, done) => {
  const user = await prisma.users.findUnique({ where: { user_id: id } });
  done(null, user);
});

module.exports = passport;