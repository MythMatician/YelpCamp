const express = require('express');
const router = express.Router();
const passport = require('passport')
const User = require('../models/user');
const { userSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

router.route('/signup')
    .get(users.renderSignUp)
    .post(catchAsync(users.signUp));

router.route('/signin')
    .get(users.renderSignIn)
    .post(passport.authenticate('local', {failureFlash: true, failureRedirect: '/signin'}), users.signIn)

router.get('/signout', users.signOut)

module.exports = router;