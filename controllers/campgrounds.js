const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
};

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const newCampground = new Campground(req.body.campground);
    newCampground.geometry = geoData.body.features[0].geometry;
    newCampground.images = req.files.map(file => ({url: file.path, filename: file.filename}));
    newCampground.author = req.user._id;
    await newCampground.save();
    console.log(newCampground);
    req.flash('success', 'Successfully created a new Campground!')
    res.redirect('/campgrounds');
};

module.exports.renderNewForm =  (req, res) => {
    res.render('campgrounds/campgroundCreate');
};

module.exports.showCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    .populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    })
    .populate('author');
    if(!campground) {
        req.flash('error', 'Campground not found...');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/campgroundShow', {campground});
};

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    res.render('campgrounds/campgroundEdit', { campground });
};

module.exports.editCampground = async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(file => ({url: file.path, filename: file.filename}));
    campground.images.push(...imgs);
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({$pull: { images: { filename: { $in: req.body.deleteImages}}}});
    }
    await campground.save();
    console.log(req.body);
    req.flash('success', 'Successfully updated Campground!')
    res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndRemove(id);
    req.flash('success', 'Successfully removed Campground!')
    res.redirect('/campgrounds');
};

