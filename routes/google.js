const express = require('express');
const passport = require('passport');

const router = express.Router();

// Google OAuth Login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: "/login" }),
  (req, res) => {
    if(!req.user) {
        return res.status(400).json({
            message: "User registered with password"
        })
    }
    res.redirect(`${process.env.FRONTEND_URL}/login?token=${req.user.token}`);
  }
);

module.exports = router;
