const express = require("express");
const passport = require("passport");
const router = express.Router();

// Initiate Google Login (redirects to Google)
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google Callback (handles auth, generates token, redirects)
router.get('/google/callback',
  passport.authenticate('google', { session: false }),  // No session; use JWT
  (req, res) => {
    const { token } = req.user;  // Token from strategy
    // Redirect to frontend with token (adjust URL)
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

// Initiate Facebook Login
router.get('/facebook', passport.authenticate('facebook', { scope: ['email'] }));

// Facebook Callback
router.get('/facebook/callback',
  passport.authenticate('facebook', { session: false }),
  (req, res) => {
    const { token } = req.user;
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);

// Optional: Logout (clear token on frontend)
router.get('/logout', (req, res) => {
  // No server-side logout for JWT; frontend clears storage
  res.redirect('http://localhost:3000/login');
});

module.exports = router;