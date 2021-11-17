const express = require('express');
const router = express.Router({mergeParams : true});
const asyncError = require('../utils/catchAsync');
const {validateCampground, isLoggedIn, isAuthor} = require('../middleware')
const campgrounds = require('../controllers/campgrounds');
const multer = require('multer')
const {storage} = require('../cloudinary');
const upload = multer({storage});

router.route('/')
    .get(asyncError(campgrounds.index))
    .post(isLoggedIn, upload.array('images'), validateCampground, asyncError(campgrounds.createCampground));

router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router.route('/:id')
    .get(asyncError(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('images'), validateCampground, asyncError(campgrounds.editCampground))
    .delete(isLoggedIn, isAuthor, asyncError(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, asyncError(campgrounds.renderEditForm));

module.exports = router;