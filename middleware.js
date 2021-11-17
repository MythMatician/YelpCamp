const Campground = require('./models/campground');
const Review = require('./models/review');
// Joi Middleware for Model Validation
const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');

// Error handling Middleware for campgrounds
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);   
    if(error) {
        const msg = error.details.map(item => item.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Error Handling for reviews
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);   
    if(error) {
        const msg = error.details.map(item => item.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

// Middleware for Checking is user is Logged In
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in...');
        return res.redirect('/signin')
    }
    next()
};

// Middleware for Checking is user is Authorized to make changes
module.exports.isAuthor = async(req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}

// Middleware for Checking is user is Authorized to make changes to Reviews
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that')
        return res.redirect(`/campgrounds/${id}`)
    }
    next();
}


