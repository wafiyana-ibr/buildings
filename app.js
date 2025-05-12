const expressWafi = require('express');
const dotenvWafi = require('dotenv');
const { formDataWafi, formDataOptionsWafi } = require('./middleware/formData');
const predictRoutesWafi = require('./routes/predict');
const dbRoutesWafi = require('./routes/dbRoutes');
const cocApiRoutesWafi = require('./routes/cocApiRoutes');
const { initAIModelWafi } = require('./helpers/modelLoader');
const { initDBConnectionWafi } = require('./db/connection');
const { initClientWafi } = require('./coc-api/cocClient');
const dbAdminRoutesWafi = require('./routes/dbAdminRoutes'); // Add admin routes import
const pathWafi = require('path');
const cookieParserWafi = require('cookie-parser');
dotenvWafi.config();
const corsWafi = require('cors');
const appWafi = expressWafi();
const PORTWafi = process.env.PORT || 3000;

// Middleware

appWafi.use(cookieParserWafi());
appWafi.use(corsWafi({
    origin: true, // Mengizinkan semua origin
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
appWafi.use(formDataWafi.parse(formDataOptionsWafi));
appWafi.use(formDataWafi.format());
appWafi.use(formDataWafi.stream());
appWafi.use(formDataWafi.union());
appWafi.use(expressWafi.urlencoded({ extended: true }));
appWafi.use(expressWafi.json());

// API Routes - organized by function
// 1. AI Prediction API
appWafi.use('/predict', predictRoutesWafi);

// 2. Clash of Clans Data APIs
appWafi.use('/api/coc', cocApiRoutesWafi);

// 3. Database API - consolidated into a single route
appWafi.use('/api', dbRoutesWafi);
appWafi.use('/api/admin', dbAdminRoutesWafi); // Register admin routes

// 4. Static files
appWafi.use('/assets', expressWafi.static(pathWafi.join(__dirname, 'public/assets')));
appWafi.use('/scanResults', expressWafi.static(pathWafi.join(__dirname, 'public/scanResults')));

// Load model, test database connection, and start server
Promise.all([initAIModelWafi(), initDBConnectionWafi(), initClientWafi()])
    .then(() => {
        appWafi.listen(PORTWafi, () => {
            console.log(`Server berjalan di port ${PORTWafi}`);
        });
    })
    .catch(errorWafi => {
        console.error("Gagal memulai server:", errorWafi);
    });
