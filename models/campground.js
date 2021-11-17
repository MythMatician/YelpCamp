const mongoose = require('mongoose');
const Review = require('./review');
const {Schema} = mongoose;

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const opt = { toJSON : { virtuals : true } };

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    images: [imageSchema],
    description: String,
    location: String,
    geometry : {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type : Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews : [
        {
            type : Schema.Types.ObjectId,
            ref : 'Review'
        }
    ]
}, opt);

campgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>`;
})

campgroundSchema.post('findOneAndDelete', async function () {
    if(doc) {
        await Review.deleteMany({
            _id : {
                $in: doc.reviews
            }
        })
    }
})

const campground = mongoose.model('Campground', campgroundSchema);

module.exports = campground;