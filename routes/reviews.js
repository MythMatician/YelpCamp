const express = require('express');
const router = express.Router({mergeParams : true});
const Campground = require('../models/campground');
const Review = require('../models/review');
const asyncError = require('../utils/catchAsync');
const {validateReview, isLoggedIn, isReviewAuthor} = require('../middleware');
const reviews = require('../controllers/reviews');

// Create a Review for a Campground Route
router.post('/', isLoggedIn, validateReview, asyncError(reviews.createReview))

// Delete Route for a review on a Campground
router.delete('/:reviewId',isLoggedIn, isReviewAuthor, asyncError(reviews.deleteReview))

module.exports = router;