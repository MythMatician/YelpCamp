const User = require('../models/user');

module.exports.renderSignUp = (req, res) => {
    res.render('users/signup');
};

module.exports.signUp = async (req, res, next) => {
    try{
        const {username, email, password} = req.body.user;
        const user = new User({username, email});
        const newUser = await User.register(user, password);
        req.login(newUser, err => {
            if(err) return next(err);
            req.flash('success', 'Welcome to Yelpcamp!');
            res.redirect('campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('signup');
    }
};

module.exports.renderSignIn = (req, res) => {
    res.render('users/signin');
};

module.exports.signIn = (req, res) => {
    const redirect = req.session.returnTo || '/campgrounds';
    req.flash('success', 'Welcome back!');
    res.redirect(redirect);
};

module.exports.signOut = (req, res) => {
    req.logOut();
    req.flash('success', 'Successfully logged out');
    res.redirect('/');
};