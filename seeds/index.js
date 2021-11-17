const mongoose = require('mongoose');
const Campground = require("../models/campground");
const Cities = require('./cities');
const {places, descriptors} = require('./seedHelpers');

mongoose.connect('mongodb://localhost:27017/YelpCamp', {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true
    })
    .then(() => {
        console.log('Connected to YelpCamp DB');
    })
    .catch(err => {
        console.error('Could not connect to YelpCamp DB', err);
    });

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for(let i = 0; i < 200; i ++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20 + 10);
        const campground = new Campground({
            author: '6171100e0ba53d1590016a00',
            title: `${sample(places)} ${sample(descriptors)}`,
            location: `${Cities[random1000].state}, ${Cities[random1000].city}`,
            geometry : {
                type: 'Point',
                coordinates: [`${Cities[random1000].longitude}`,`${Cities[random1000].latitude}`]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/mythmatician/image/upload/v1636456931/YelpCamp/id2jsbjucl0lsuhszkgi.jpg',
                    filename: 'YelpCamp/id2jsbjucl0lsuhszkgi'
                },
                {
                    url: 'https://res.cloudinary.com/mythmatician/image/upload/v1636456934/YelpCamp/vyj7kzrhk2cynhijwuxd.jpg',
                    filename: 'YelpCamp/vyj7kzrhk2cynhijwuxd'
                }
              ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum, maxime illo voluptas, repudiandae corporis, rem eos eum non fugiat ipsa alias sequi. Odit hic ex pariatur consequatur corrupti cum quis.',
            price,
        });
        await campground.save();
    } 
}

seedDB().then(() => {
    mongoose.connection.close();
})