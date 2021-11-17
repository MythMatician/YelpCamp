if(process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const User = require('./models/user');
const methodOverride = require('method-override');
// Class extension for Error Handling
const ExpressError = require('./utils/ExpressError');
// Campground Routes
const campgroundRoutes = require('./routes/campgrounds')
// Review Routes
const reviewRoutes = require('./routes/reviews');
// User Routes
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/YelpCamp';
const secret = process.env.SECRET || 'sessionsecret';
const port = process.env.PORT || 3000;

// Connect to our MongoDB
mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true, 
    useUnifiedTopology: true,
    useFindAndModify: false
    })
    .then(() => {
        console.log('Connected to YelpCamp DB');
    })
    .catch(err => {
        console.error('Could not connect to YelpCamp DB', err);
    });

// Templating Engine Middleware
app.engine('ejs', ejsMate);
// Templating Middleware
app.set('view engine', 'ejs');
// Views Middleware
app.set('views', path.join(__dirname, '/views'));

// Static Route Middleware
app.use(express.static(path.join(__dirname, '/public')));
// Form Parsing Middleware
app.use(express.urlencoded({extended: true}));
// Form Method Middleware
app.use(methodOverride('_method'));

const store = new MongoStore({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60 
})

store.on('error', (e) => {
    console.log('Store session error', e);
})

// Seesion Options
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave : false,
    saveUninitialized  :true,
    cookie : {
        expires : Date.now + 1000 * 60 * 60 * 24 * 7,
        maxAge : 1000 * 60 * 60 * 24 * 7,
        httpOnly : true,
        // secure: true
    }
}

// Session Middleware
app.use(session(sessionConfig));
// Flash Middleware
app.use(flash());

app.use(passport.initialize());
app.use(passport.session())

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash Middleware
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.use(mongoSanitize());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
    "https://unpkg.com/aos@2.3.1/dist/aos.js"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
    "https://unpkg.com/aos@2.3.1/dist/aos.css" 
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/mythmatician/",
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Mount campground routes on Server Middleware
app.use('/campgrounds', campgroundRoutes);
// Mount review routes on Server Middleware
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.use('/', userRoutes)

// Home Route
app.get('/', (req, res,) => {
    res.render('home');
})

// Error Handling Middleware
app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 400));
})

// Error Handling Middleware
app.use((err, req, res, next) => {
    const { message, statusCode} = err;
    res.status(statusCode).render('error', {err});
})

app.listen(port, () => {
    console.log(`Listening on Port ${port}`);
})